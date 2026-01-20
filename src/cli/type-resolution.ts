import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  ImportDeclarationStructure,
  Node,
  Project,
  Type,
  TypeAliasDeclaration,
} from 'ts-morph';
import {StructureKind} from 'ts-morph';
import {TypeFormatFlags} from 'typescript';

export interface CustomTypeRequest {
  tableName: string;
  columnName: string;
}

export interface ResolveCustomTypesOptions {
  project: Project;
  helperName: 'CustomType' | 'ZeroCustomType';
  schemaTypeExpression: string;
  schemaImports: ResolverImport[];
  requests: Iterable<CustomTypeRequest>;
}

export type ResolvedCustomTypeMap = Map<string, string>;

export const COLUMN_SEPARATOR = '::|::';

const RESOLVER_FILE_NAME = '__drizzle_zero_type_resolver.ts';

type ResolverImport = Omit<ImportDeclarationStructure, 'kind'>;

/**
 * Find the module specifier for importing CustomType/ZeroCustomType.
 *
 * When running inside the drizzle-zero package itself (e.g., during tests),
 * the normal 'drizzle-zero' import fails due to export map resolution issues.
 * In that case, we try to find the source file directly.
 */
function getDrizzleZeroModuleSpecifier(project: Project): string {
  // Get the project root directory
  const tsConfigPath = project.getCompilerOptions().configFilePath;
  const projectRoot = tsConfigPath
    ? path.dirname(String(tsConfigPath))
    : process.cwd();

  // Check if we're inside the drizzle-zero package by looking for src/relations.ts
  const relationsSourcePath = path.join(projectRoot, 'src', 'relations.ts');
  const relationsDistPath = path.join(projectRoot, 'dist', 'relations.js');

  // Also check one level up (for test fixtures in subdirectories)
  const parentRelationsSource = path.join(
    projectRoot,
    '..',
    'src',
    'relations.ts',
  );
  const parentRelationsDist = path.join(
    projectRoot,
    '..',
    'dist',
    'relations.js',
  );

  // Check if this looks like we're inside drizzle-zero
  if (
    fs.existsSync(relationsSourcePath) ||
    fs.existsSync(relationsDistPath)
  ) {
    // Check if package.json confirms this is drizzle-zero
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (pkg.name === 'drizzle-zero') {
          return fs.existsSync(relationsSourcePath)
            ? relationsSourcePath
            : relationsDistPath;
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
  }

  // Check parent directory (for test fixtures like no-config-integration)
  if (
    fs.existsSync(parentRelationsSource) ||
    fs.existsSync(parentRelationsDist)
  ) {
    const parentPackageJson = path.join(projectRoot, '..', 'package.json');
    if (fs.existsSync(parentPackageJson)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(parentPackageJson, 'utf-8'));
        if (pkg.name === 'drizzle-zero') {
          return fs.existsSync(parentRelationsSource)
            ? parentRelationsSource
            : parentRelationsDist;
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
  }

  // Default to npm package
  return 'drizzle-zero';
}

// Use UseAliasDefinedOutsideCurrentScope first to preserve known type aliases
// like ReadonlyJSONValue. If the result is not safe, fall back to InTypeAlias
// to expand custom type aliases to their underlying structure.
const preserveAliasFlags =
  TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
  TypeFormatFlags.NoTruncation;
const expandAliasFlags =
  TypeFormatFlags.InTypeAlias | TypeFormatFlags.NoTruncation;

export function resolveCustomTypes({
  project,
  helperName,
  schemaTypeExpression,
  schemaImports,
  requests,
}: ResolveCustomTypesOptions): ResolvedCustomTypeMap {
  const uniqueRequests = new Map<string, CustomTypeRequest>();
  for (const request of requests) {
    const key = `${request.tableName}${COLUMN_SEPARATOR}${request.columnName}`;
    if (!uniqueRequests.has(key)) {
      uniqueRequests.set(key, request);
    }
  }

  if (uniqueRequests.size === 0) {
    return new Map();
  }

  const resolverFile = project.createSourceFile(RESOLVER_FILE_NAME, '', {
    overwrite: true,
  });

  resolverFile.addImportDeclarations(
    schemaImports.map(
      (structure): ImportDeclarationStructure => ({
        kind: StructureKind.ImportDeclaration,
        ...structure,
      }),
    ),
  );

  // Try to find the best module specifier for drizzle-zero
  // (handles the case when we're running inside the drizzle-zero package itself)
  const drizzleZeroModuleSpecifier = getDrizzleZeroModuleSpecifier(project);

  resolverFile.addImportDeclaration({
    moduleSpecifier: drizzleZeroModuleSpecifier,
    namedImports: [{name: helperName}],
    isTypeOnly: true,
  });

  const aliasByRequest = new Map<string, TypeAliasDeclaration>();

  for (const [key, request] of uniqueRequests) {
    const aliasName = `__DZ_CT_${aliasByRequest.size}`;
    const typeExpression = `${helperName}<${schemaTypeExpression}, "${request.tableName}", "${request.columnName}">`;
    aliasByRequest.set(
      key,
      resolverFile.addTypeAlias({
        name: aliasName,
        type: typeExpression,
        isExported: false,
      }),
    );
  }

  const resolved = new Map<string, string>();

  for (const [key, alias] of aliasByRequest.entries()) {
    const type = alias.getType();

    // First, try with preserveAliasFlags to keep known type aliases like ReadonlyJSONValue
    let text = type.getText(alias, preserveAliasFlags);

    // If the preserved alias is safe (e.g., ReadonlyJSONValue, string, number), use it
    if (isSafeResolvedType(text)) {
      resolved.set(key, text);
      continue;
    }

    // Otherwise, try expanding with InTypeAlias flag
    text = type.getText(alias, expandAliasFlags);

    // If the type text is not safe (e.g., interface reference like `drizzleSchema.TestInterface`),
    // try to construct an object literal from the type's properties
    if (!isSafeResolvedType(text) && type.isObject()) {
      const objectLiteral = buildObjectLiteralFromType(type, alias);
      if (objectLiteral && isSafeResolvedType(objectLiteral)) {
        text = objectLiteral;
      }
    }

    if (isSafeResolvedType(text)) {
      resolved.set(key, text);
    }
  }

  resolverFile.delete();

  return resolved;
}

/**
 * Build an object literal type string from a Type's properties.
 * This is used to expand interface types that TypeScript doesn't automatically expand.
 */
function buildObjectLiteralFromType(
  type: Type,
  node: Node,
): string | undefined {
  try {
    const properties = type.getProperties();
    if (properties.length === 0) {
      return '{}';
    }

    const propertyStrings: string[] = [];

    for (const prop of properties) {
      const propName = prop.getName();
      const propType = prop.getTypeAtLocation(node);

      // First try preserving aliases (for ReadonlyJSONValue, etc.)
      let propText = propType.getText(node, preserveAliasFlags);
      if (!isSafeResolvedType(propText)) {
        // Fall back to expanding
        propText = propType.getText(node, expandAliasFlags);
      }

      // Check if the property type is safe
      if (!isSafeResolvedType(propText)) {
        // If any property is not safe, abort
        return undefined;
      }

      // Check if the property is optional
      const isOptional = prop.isOptional();

      propertyStrings.push(`${propName}${isOptional ? '?' : ''}: ${propText}`);
    }

    return `{ ${propertyStrings.join('; ')}; }`;
  } catch {
    return undefined;
  }
}

/**
 * Set of identifiers that are allowed in resolved types.
 * Only lowercase primitive types are allowed - any PascalCase identifier
 * (like Date, Map, custom interfaces) will cause the type to be rejected,
 * falling back to the ZeroCustomType helper for runtime resolution.
 */
const allowedTypeIdentifiers = new Set<string>([
  'boolean',
  'number',
  'string',
  'true',
  'false',
  'null',
  'undefined',
]);

/**
 * Check if a resolved type is safe to include in the generated schema.
 *
 * This function uses an ALLOWLIST approach - only primitive types and
 * simple structures built from them are accepted. Any PascalCase identifiers
 * (like Date, Map, user-defined types) cause rejection.
 *
 * When a type is rejected, the schema generator falls back to using the
 * ZeroCustomType<typeof drizzleSchema, "table", "col"> helper, which
 * resolves the type at compile time by referencing the Drizzle schema.
 *
 * This means user-defined $type<RecordData>() DOES work - it just uses
 * the ZeroCustomType helper instead of emitting the type name directly.
 */
export const isSafeResolvedType = (typeText: string | undefined): boolean => {
  if (!typeText) {
    return false;
  }

  // Special case: ReadonlyJSONValue is safe (auto-imported by the generator)
  // ReadonlyJSONObject falls back to ZeroCustomType since it's not auto-imported
  if (typeText === 'ReadonlyJSONValue') {
    return true;
  }

  // Block known problematic patterns
  if (
    typeText === 'unknown' ||
    typeText === 'any' ||
    typeText.includes('__error__') ||
    typeText.includes('() ') ||
    typeText === 'SchemaIsAnyError' ||
    typeText.includes('CustomType') ||
    typeText.includes('ZeroCustomType') ||
    typeText.includes('import(') ||
    typeText.includes('=>')
  ) {
    return false;
  }

  // Helper to find previous non-whitespace character
  const getPrevNonWhitespace = (index: number) => {
    for (let i = index - 1; i >= 0; i--) {
      const char = typeText[i] ?? '';
      if (char.trim()) {
        return char;
      }
    }
    return '';
  };

  // Helper to find next non-whitespace character
  const getNextNonWhitespace = (index: number) => {
    for (let i = index; i < typeText.length; i++) {
      const char = typeText[i] ?? '';
      if (char.trim()) {
        return char;
      }
    }
    return '';
  };

  // Scan for identifiers and check each one
  const identifierRegex = /\b[A-Za-z_]\w*\b/g;
  const matches = typeText.matchAll(identifierRegex);

  for (const match of matches) {
    const identifier = match[0] ?? '';
    const startIndex = match.index ?? 0;
    const endIndex = startIndex + identifier.length;
    const prevChar = getPrevNonWhitespace(startIndex);
    const nextChar = getNextNonWhitespace(endIndex);

    // Skip identifiers inside string literals
    if (prevChar === "'" || prevChar === '"' || prevChar === '`') {
      continue;
    }

    // Skip indexed access patterns like { }_["key"]
    if (/^_+$/.test(identifier) && prevChar === '}') {
      continue;
    }

    // Skip property names (identifier followed by colon)
    if (nextChar === ':') {
      continue;
    }

    // Skip optional property names (identifier followed by ?: )
    if (nextChar === '?' && getNextNonWhitespace(endIndex + 1) === ':') {
      continue;
    }

    // Check if identifier is in allowlist (must be lowercase and allowed)
    const normalized = identifier.toLowerCase();
    if (identifier === normalized && allowedTypeIdentifiers.has(normalized)) {
      continue;
    }

    // Any other identifier (PascalCase, unknown lowercase) is not safe
    return false;
  }

  return true;
};
