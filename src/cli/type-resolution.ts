import type {
  ImportDeclarationStructure,
  Project,
  TypeAliasDeclaration,
} from "ts-morph";
import { StructureKind } from "ts-morph";
import { TypeFormatFlags } from "typescript";

export interface CustomTypeRequest {
  tableName: string;
  columnName: string;
}

export interface ResolveCustomTypesOptions {
  project: Project;
  helperName: "CustomType" | "ZeroCustomType";
  schemaTypeExpression: string;
  schemaImports: ResolverImport[];
  requests: Iterable<CustomTypeRequest>;
}

export type ResolvedCustomTypeMap = Map<string, string>;

export const COLUMN_SEPARATOR = "::|::";

const RESOLVER_FILE_NAME = "__drizzle_zero_type_resolver.ts";

type ResolverImport = Omit<ImportDeclarationStructure, "kind">;

const typeFormatFlags =
  TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
  TypeFormatFlags.NoTruncation |
  TypeFormatFlags.WriteArrowStyleSignature;

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

  const resolverFile = project.createSourceFile(RESOLVER_FILE_NAME, "", {
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

  resolverFile.addImportDeclaration({
    moduleSpecifier: "zero-drizzle",
    namedImports: [{ name: helperName }],
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
    const text = type.getText(alias, typeFormatFlags);

    if (isSafeResolvedType(text)) {
      resolved.set(key, text);
    }
  }

  resolverFile.delete();

  return resolved;
}

const allowedTypeIdentifiers = new Set<string>([
  "boolean",
  "number",
  "string",
  "true",
  "false",
  "null",
  "undefined",
]);

export const isSafeResolvedType = (typeText: string | undefined): boolean => {
  if (!typeText) {
    return false;
  }

  if (typeText === "ReadonlyJSONValue") {
    return true;
  }

  if (
    typeText === "unknown" ||
    typeText === "any" ||
    typeText.includes("__error__") ||
    typeText.includes("() ") ||
    typeText === "SchemaIsAnyError" ||
    typeText.includes("CustomType") ||
    typeText.includes("ZeroCustomType") ||
    typeText.includes("import(") ||
    typeText.includes("=>")
  ) {
    return false;
  }

  const getPrevNonWhitespace = (index: number) => {
    for (let i = index - 1; i >= 0; i--) {
      const char = typeText[i] ?? "";
      if (char.trim()) {
        return char;
      }
    }

    return "";
  };

  const getNextNonWhitespace = (index: number) => {
    for (let i = index; i < typeText.length; i++) {
      const char = typeText[i] ?? "";
      if (char.trim()) {
        return char;
      }
    }

    return "";
  };

  const identifierRegex = /\b[A-Za-z_]\w*\b/g;
  const matches = typeText.matchAll(identifierRegex);

  for (const match of matches) {
    const identifier = match[0] ?? "";
    const startIndex = match.index ?? 0;
    const endIndex = startIndex + identifier.length;
    const prevChar = getPrevNonWhitespace(startIndex);
    const nextChar = getNextNonWhitespace(endIndex);

    if (prevChar === "'" || prevChar === '"' || prevChar === "`") {
      continue;
    }

    if (/^_+$/.test(identifier) && prevChar === "}") {
      continue;
    }

    if (nextChar === ":") {
      continue;
    }

    if (nextChar === "?" && getNextNonWhitespace(endIndex + 1) === ":") {
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
