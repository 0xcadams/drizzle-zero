import * as path from "node:path";
import { Project } from "ts-morph";
import { beforeEach, describe, expect, it } from "vitest";
import { getConfigFromFile } from "../src/cli/config";

describe("getConfigFromFile", () => {
  let tsProject: Project;

  beforeEach(() => {
    tsProject = new Project({
      tsConfigFilePath: path.resolve(__dirname, "../tsconfig.json"),
    });
  });

  it("should successfully load and parse a valid config file", async () => {
    const configFilePath = path.resolve(__dirname, "../integration/drizzle-zero.config.ts");
    
    const result = await getConfigFromFile({
      configFilePath,
      tsProject,
    });

    // Verify the result structure
    expect(result.type).toBe("config");
    expect(result.exportName).toBe("schema");
    expect(result.zeroSchema).toBeDefined();
    expect(result.zeroSchemaTypeDeclarations).toBeDefined();
    
    // Verify the schema has the expected structure
    expect(result.zeroSchema?.tables).toBeDefined();
    expect(typeof result.zeroSchema?.tables).toBe("object");
    
    // Verify some expected tables from the integration config
    expect(result.zeroSchema?.tables).toHaveProperty("user");
    expect(result.zeroSchema?.tables).toHaveProperty("message");

    expect(result.zeroSchema).toMatchInlineSnapshot(`
      {
        "relationships": {
          "filters": {
            "children": [
              {
                "cardinality": "many",
                "destField": [
                  "parentId",
                ],
                "destSchema": "filters",
                "sourceField": [
                  "id",
                ],
              },
            ],
            "parent": [
              {
                "cardinality": "one",
                "destField": [
                  "id",
                ],
                "destSchema": "filters",
                "sourceField": [
                  "parentId",
                ],
              },
            ],
          },
          "medium": {
            "messages": [
              {
                "cardinality": "many",
                "destField": [
                  "mediumId",
                ],
                "destSchema": "message",
                "sourceField": [
                  "id",
                ],
              },
            ],
          },
          "message": {
            "medium": [
              {
                "cardinality": "one",
                "destField": [
                  "id",
                ],
                "destSchema": "medium",
                "sourceField": [
                  "mediumId",
                ],
              },
            ],
            "sender": [
              {
                "cardinality": "one",
                "destField": [
                  "id",
                ],
                "destSchema": "user",
                "sourceField": [
                  "senderId",
                ],
              },
            ],
          },
          "user": {
            "friends": [
              {
                "cardinality": "many",
                "destField": [
                  "requestingId",
                ],
                "destSchema": "friendship",
                "sourceField": [
                  "id",
                ],
              },
              {
                "cardinality": "many",
                "destField": [
                  "id",
                ],
                "destSchema": "user",
                "sourceField": [
                  "acceptingId",
                ],
              },
            ],
            "mediums": [
              {
                "cardinality": "many",
                "destField": [
                  "senderId",
                ],
                "destSchema": "message",
                "sourceField": [
                  "id",
                ],
              },
              {
                "cardinality": "many",
                "destField": [
                  "id",
                ],
                "destSchema": "medium",
                "sourceField": [
                  "mediumId",
                ],
              },
            ],
            "messages": [
              {
                "cardinality": "many",
                "destField": [
                  "senderId",
                ],
                "destSchema": "message",
                "sourceField": [
                  "id",
                ],
              },
            ],
          },
        },
        "tables": {
          "allTypes": {
            "columns": {
              "bigSerialField": {
                "customType": null,
                "optional": true,
                "serverName": "bigserial",
                "type": "number",
              },
              "bigintField": {
                "customType": null,
                "optional": false,
                "serverName": "bigint",
                "type": "number",
              },
              "bigintNumberField": {
                "customType": null,
                "optional": false,
                "serverName": "bigint_number",
                "type": "number",
              },
              "booleanField": {
                "customType": null,
                "optional": false,
                "serverName": "boolean",
                "type": "boolean",
              },
              "charField": {
                "customType": null,
                "optional": false,
                "serverName": "char",
                "type": "string",
              },
              "createdAt": {
                "customType": null,
                "optional": true,
                "type": "number",
              },
              "dateField": {
                "customType": null,
                "optional": false,
                "serverName": "date",
                "type": "number",
              },
              "decimalField": {
                "customType": null,
                "optional": false,
                "serverName": "decimal",
                "type": "number",
              },
              "doublePrecisionField": {
                "customType": null,
                "optional": false,
                "serverName": "double_precision",
                "type": "number",
              },
              "id": {
                "customType": null,
                "optional": false,
                "type": "string",
              },
              "integerField": {
                "customType": null,
                "optional": false,
                "serverName": "integer",
                "type": "number",
              },
              "jsonField": {
                "customType": null,
                "optional": false,
                "serverName": "json",
                "type": "json",
              },
              "jsonbField": {
                "customType": null,
                "optional": false,
                "serverName": "jsonb",
                "type": "json",
              },
              "numericField": {
                "customType": null,
                "optional": false,
                "serverName": "numeric",
                "type": "number",
              },
              "optionalBigint": {
                "customType": null,
                "optional": true,
                "serverName": "optional_bigint",
                "type": "number",
              },
              "optionalBoolean": {
                "customType": null,
                "optional": true,
                "serverName": "optional_boolean",
                "type": "boolean",
              },
              "optionalDoublePrecision": {
                "customType": null,
                "optional": true,
                "serverName": "optional_double_precision",
                "type": "number",
              },
              "optionalEnum": {
                "customType": null,
                "optional": true,
                "serverName": "optional_enum",
                "type": "string",
              },
              "optionalInteger": {
                "customType": null,
                "optional": true,
                "serverName": "optional_integer",
                "type": "number",
              },
              "optionalJson": {
                "customType": null,
                "optional": true,
                "serverName": "optional_json",
                "type": "json",
              },
              "optionalNumeric": {
                "customType": null,
                "optional": true,
                "serverName": "optional_numeric",
                "type": "number",
              },
              "optionalReal": {
                "customType": null,
                "optional": true,
                "serverName": "optional_real",
                "type": "number",
              },
              "optionalSmallint": {
                "customType": null,
                "optional": true,
                "serverName": "optional_smallint",
                "type": "number",
              },
              "optionalText": {
                "customType": null,
                "optional": true,
                "serverName": "optional_text",
                "type": "string",
              },
              "optionalTimestamp": {
                "customType": null,
                "optional": true,
                "serverName": "optional_timestamp",
                "type": "number",
              },
              "optionalUuid": {
                "customType": null,
                "optional": true,
                "serverName": "optional_uuid",
                "type": "string",
              },
              "optionalVarchar": {
                "customType": null,
                "optional": true,
                "serverName": "optional_varchar",
                "type": "string",
              },
              "realField": {
                "customType": null,
                "optional": false,
                "serverName": "real",
                "type": "number",
              },
              "serialField": {
                "customType": null,
                "optional": true,
                "serverName": "serial",
                "type": "number",
              },
              "smallSerialField": {
                "customType": null,
                "optional": true,
                "serverName": "smallserial",
                "type": "number",
              },
              "smallintField": {
                "customType": null,
                "optional": false,
                "serverName": "smallint",
                "type": "number",
              },
              "statusField": {
                "customType": null,
                "optional": false,
                "serverName": "status",
                "type": "string",
              },
              "textField": {
                "customType": null,
                "optional": false,
                "serverName": "text",
                "type": "string",
              },
              "timestampField": {
                "customType": null,
                "optional": false,
                "serverName": "timestamp",
                "type": "number",
              },
              "timestampModeDate": {
                "customType": null,
                "optional": false,
                "serverName": "timestamp_mode_date",
                "type": "number",
              },
              "timestampModeString": {
                "customType": null,
                "optional": false,
                "serverName": "timestamp_mode_string",
                "type": "number",
              },
              "timestampTzField": {
                "customType": null,
                "optional": false,
                "serverName": "timestamp_tz",
                "type": "number",
              },
              "typedJsonField": {
                "customType": null,
                "optional": false,
                "serverName": "typed_json",
                "type": "json",
              },
              "updatedAt": {
                "customType": null,
                "optional": true,
                "type": "number",
              },
              "uuidField": {
                "customType": null,
                "optional": false,
                "serverName": "uuid",
                "type": "string",
              },
              "varcharField": {
                "customType": null,
                "optional": false,
                "serverName": "varchar",
                "type": "string",
              },
            },
            "name": "allTypes",
            "primaryKey": [
              "id",
            ],
            "serverName": "all_types",
          },
          "filters": {
            "columns": {
              "id": {
                "customType": null,
                "optional": false,
                "type": "string",
              },
              "name": {
                "customType": null,
                "optional": true,
                "type": "string",
              },
              "parentId": {
                "customType": null,
                "optional": true,
                "serverName": "parent_id",
                "type": "string",
              },
            },
            "name": "filters",
            "primaryKey": [
              "id",
            ],
          },
          "friendship": {
            "columns": {
              "accepted": {
                "customType": null,
                "optional": false,
                "type": "boolean",
              },
              "acceptingId": {
                "customType": null,
                "optional": false,
                "serverName": "accepting_id",
                "type": "string",
              },
              "requestingId": {
                "customType": null,
                "optional": false,
                "serverName": "requesting_id",
                "type": "string",
              },
            },
            "name": "friendship",
            "primaryKey": [
              "requestingId",
              "acceptingId",
            ],
          },
          "medium": {
            "columns": {
              "createdAt": {
                "customType": null,
                "optional": true,
                "type": "number",
              },
              "id": {
                "customType": null,
                "optional": false,
                "type": "string",
              },
              "name": {
                "customType": null,
                "optional": false,
                "type": "string",
              },
              "updatedAt": {
                "customType": null,
                "optional": true,
                "type": "number",
              },
            },
            "name": "medium",
            "primaryKey": [
              "id",
            ],
          },
          "message": {
            "columns": {
              "body": {
                "customType": null,
                "optional": false,
                "type": "string",
              },
              "createdAt": {
                "customType": null,
                "optional": true,
                "type": "number",
              },
              "id": {
                "customType": null,
                "optional": false,
                "type": "string",
              },
              "mediumId": {
                "customType": null,
                "optional": true,
                "type": "string",
              },
              "metadata": {
                "customType": null,
                "optional": false,
                "type": "json",
              },
              "senderId": {
                "customType": null,
                "optional": true,
                "type": "string",
              },
              "updatedAt": {
                "customType": null,
                "optional": true,
                "type": "number",
              },
            },
            "name": "message",
            "primaryKey": [
              "id",
            ],
          },
          "user": {
            "columns": {
              "createdAt": {
                "customType": null,
                "optional": true,
                "type": "number",
              },
              "customInterfaceJson": {
                "customType": null,
                "optional": false,
                "serverName": "custom_interface_json",
                "type": "json",
              },
              "customTypeJson": {
                "customType": null,
                "optional": false,
                "serverName": "custom_type_json",
                "type": "json",
              },
              "email": {
                "customType": null,
                "optional": false,
                "type": "string",
              },
              "id": {
                "customType": null,
                "optional": false,
                "type": "string",
              },
              "name": {
                "customType": null,
                "optional": false,
                "type": "string",
              },
              "partner": {
                "customType": null,
                "optional": false,
                "type": "boolean",
              },
              "testExportedType": {
                "customType": null,
                "optional": false,
                "serverName": "test_exported_type",
                "type": "json",
              },
              "testInterface": {
                "customType": null,
                "optional": false,
                "serverName": "test_interface",
                "type": "json",
              },
              "testType": {
                "customType": null,
                "optional": false,
                "serverName": "test_type",
                "type": "json",
              },
              "updatedAt": {
                "customType": null,
                "optional": true,
                "type": "number",
              },
            },
            "name": "user",
            "primaryKey": [
              "id",
            ],
          },
        },
      }
    `);
  });
}); 