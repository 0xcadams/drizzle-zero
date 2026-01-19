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
 * Build a set of character index ranges that are inside string literals.
 * This handles single quotes, double quotes, and template literals.
 * For template literals (backticks), ${...} interpolations are NOT marked as
 * string content, but nested string literals inside interpolations ARE scanned.
 */
function buildStringLiteralRanges(
  text: string,
): Array<{start: number; end: number}> {
  const ranges: Array<{start: number; end: number}> = [];
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    if (char === '"' || char === "'") {
      // Single/double quotes: entire content is a string literal
      const quoteChar = char;
      const start = i;
      i++; // move past opening quote

      // Find the closing quote, handling escapes
      while (i < text.length) {
        if (text[i] === '\\') {
          // Skip escaped character
          i += 2;
        } else if (text[i] === quoteChar) {
          // Found closing quote
          i++; // move past closing quote
          break;
        } else {
          i++;
        }
      }

      // Range includes both quotes and everything between
      ranges.push({start, end: i});
    } else if (char === '`') {
      // Template literal: need to handle ${...} interpolations
      // Only the literal text parts are "inside string", not the interpolations
      let literalStart = i; // start of current literal part
      i++; // move past opening backtick

      while (i < text.length) {
        if (text[i] === '\\') {
          // Skip escaped character
          i += 2;
        } else if (text[i] === '$' && text[i + 1] === '{') {
          // Start of interpolation - mark the literal part before it (including the backtick)
          ranges.push({start: literalStart, end: i});
          // Skip past the ${
          i += 2;
          // Scan inside the interpolation for nested string literals
          let braceDepth = 1;
          while (i < text.length && braceDepth > 0) {
            if (text[i] === '{') {
              braceDepth++;
              i++;
            } else if (text[i] === '}') {
              braceDepth--;
              if (braceDepth > 0) i++;
            } else if (text[i] === '"' || text[i] === "'") {
              // Found a string literal inside the interpolation - scan it
              const quoteChar = text[i];
              const stringStart = i;
              i++; // move past opening quote
              while (i < text.length) {
                if (text[i] === '\\') {
                  i += 2;
                } else if (text[i] === quoteChar) {
                  i++;
                  break;
                } else {
                  i++;
                }
              }
              ranges.push({start: stringStart, end: i});
            } else {
              i++;
            }
          }
          if (braceDepth === 0) {
            i++; // move past the closing }
          }
          // Start a new literal part after the interpolation
          literalStart = i;
        } else if (text[i] === '`') {
          // End of template literal - mark the final literal part
          ranges.push({start: literalStart, end: i + 1});
          i++; // move past closing backtick
          break;
        } else {
          i++;
        }
      }
    } else {
      i++;
    }
  }

  return ranges;
}

/**
 * Check if an index is inside any of the given string literal ranges.
 */
function isInsideStringLiteral(
  index: number,
  ranges: Array<{start: number; end: number}>,
): boolean {
  for (const range of ranges) {
    if (index > range.start && index < range.end) {
      return true;
    }
  }
  return false;
}

export const isSafeResolvedType = (typeText: string | undefined): boolean => {
  if (!typeText) {
    return false;
  }

  if (typeText === 'ReadonlyJSONValue') {
    return true;
  }

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

  // Pre-compute string literal ranges to properly detect identifiers inside strings
  const stringRanges = buildStringLiteralRanges(typeText);

  const getPrevNonWhitespace = (index: number) => {
    for (let i = index - 1; i >= 0; i--) {
      const char = typeText[i] ?? '';
      if (char.trim()) {
        return char;
      }
    }

    return '';
  };

  const getNextNonWhitespace = (index: number) => {
    for (let i = index; i < typeText.length; i++) {
      const char = typeText[i] ?? '';
      if (char.trim()) {
        return char;
      }
    }

    return '';
  };

  const identifierRegex = /\b[A-Za-z_]\w*\b/g;
  const matches = typeText.matchAll(identifierRegex);

  for (const match of matches) {
    const identifier = match[0] ?? '';
    const startIndex = match.index ?? 0;
    const endIndex = startIndex + identifier.length;
    const prevChar = getPrevNonWhitespace(startIndex);
    const nextChar = getNextNonWhitespace(endIndex);

    // Skip identifiers that are inside string literals
    if (isInsideStringLiteral(startIndex, stringRanges)) {
      continue;
    }

    if (/^_+$/.test(identifier) && prevChar === '}') {
      continue;
    }

    if (nextChar === ':') {
      continue;
    }

    if (nextChar === '?' && getNextNonWhitespace(endIndex + 1) === ':') {
      continue;
    }

    const normalized = identifier.toLowerCase();

    if (identifier === normalized && allowedTypeIdentifiers.has(normalized)) {
      continue;
    }

    return false;
  }

  return true;
};
