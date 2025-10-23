import {
  pgTable,
  text,
  jsonb,
  timestamp,
  pgEnum,
  integer,
  boolean as pgBoolean,
  customType,
  varchar,
  serial,
} from "drizzle-orm/pg-core";
import { describe, expectTypeOf, test } from "vitest";
import type { CustomType } from "../src/relations";

describe("CustomType", () => {
  test("extracts custom type from jsonb.$type<T>()", () => {
    interface CustomJsonType {
      theme: string;
      fontSize: number;
    }

    interface UserMetadata {
      preferences: Record<string, unknown>;
      lastLogin: string;
    }

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      customField: jsonb("custom_field").$type<CustomJsonType>().notNull(),
      metadata: jsonb("metadata").$type<UserMetadata>(),
    });

    const schema = { testTable };

    // Test that CustomType correctly extracts the custom types
    type ExtractedCustomField = CustomType<
      typeof schema,
      "testTable",
      "customField"
    >;
    type ExtractedMetadata = CustomType<typeof schema, "testTable", "metadata">;
    type ExtractedId = CustomType<typeof schema, "testTable", "id">;

    // Verify types at compile time using expectTypeOf
    expectTypeOf<ExtractedCustomField>().toEqualTypeOf<CustomJsonType>();
    expectTypeOf<ExtractedMetadata>().toEqualTypeOf<UserMetadata>();
    expectTypeOf<ExtractedId>().toEqualTypeOf<string>();
  });

  test("extracts email template string type from text.$type<T>()", () => {
    const userTable = pgTable("user", {
      id: text("id").primaryKey(),
      email: text("email").$type<`${string}@${string}`>().notNull(),
      name: text("name").notNull(),
    });

    const schema = { userTable };

    type ExtractedEmail = CustomType<typeof schema, "userTable", "email">;
    type ExtractedName = CustomType<typeof schema, "userTable", "name">;

    // Email should have the template string type
    expectTypeOf<ExtractedEmail>().toEqualTypeOf<`${string}@${string}`>();
    expectTypeOf<ExtractedName>().toEqualTypeOf<string>();
  });

  test("extracts enum types from pgEnum", () => {
    const statusEnum = pgEnum("status_type", ["active", "inactive", "pending"]);

    const taskTable = pgTable("task", {
      id: text("id").primaryKey(),
      status: statusEnum("status").notNull(),
      name: text("name").notNull(),
    });

    const schema = { taskTable, statusEnum };

    type ExtractedStatus = CustomType<typeof schema, "taskTable", "status">;

    // Enum should extract to its literal union type
    expectTypeOf<ExtractedStatus>().toEqualTypeOf<
      "active" | "inactive" | "pending"
    >();
  });

  test("extracts timestamp types as number (Zero representation)", () => {
    const eventTable = pgTable("event", {
      id: text("id").primaryKey(),
      createdAt: timestamp("created_at", { mode: "string" })
        .defaultNow()
        .notNull(),
      updatedAt: timestamp("updated_at", { mode: "date" })
        .defaultNow()
        .notNull(),
      plainTimestamp: timestamp("plain_timestamp").notNull(),
    });

    const schema = { eventTable };

    type ExtractedCreatedAt = CustomType<
      typeof schema,
      "eventTable",
      "createdAt"
    >;
    type ExtractedUpdatedAt = CustomType<
      typeof schema,
      "eventTable",
      "updatedAt"
    >;
    type ExtractedPlainTimestamp = CustomType<
      typeof schema,
      "eventTable",
      "plainTimestamp"
    >;

    // CustomType maps to Zero schema types where timestamps are numbers
    // regardless of their Drizzle mode (string/date)
    expectTypeOf<ExtractedCreatedAt>().toEqualTypeOf<number>();
    expectTypeOf<ExtractedUpdatedAt>().toEqualTypeOf<number>();
    expectTypeOf<ExtractedPlainTimestamp>().toEqualTypeOf<number>();
  });

  test("handles timestamp with custom type override", () => {
    type ISODateString = string & { __brand: "ISODateString" };

    const eventTable = pgTable("event", {
      id: text("id").primaryKey(),
      customTimestamp: timestamp("custom_timestamp")
        .$type<ISODateString>()
        .notNull(),
    });

    const schema = { eventTable };

    type ExtractedCustomTimestamp = CustomType<
      typeof schema,
      "eventTable",
      "customTimestamp"
    >;

    // When using $type, the custom type should be preserved
    expectTypeOf<ExtractedCustomTimestamp>().toEqualTypeOf<ISODateString>();
  });

  test("handles nested custom types in arrays", () => {
    interface TagMetadata {
      color: string;
      priority: number;
    }

    const articleTable = pgTable("article", {
      id: text("id").primaryKey(),
      tags: jsonb("tags").$type<TagMetadata[]>().notNull(),
    });

    const schema = { articleTable };

    type ExtractedTags = CustomType<typeof schema, "articleTable", "tags">;

    expectTypeOf<ExtractedTags>().toEqualTypeOf<TagMetadata[]>();
  });

  test("returns unknown for non-existent table or column", () => {
    const simpleTable = pgTable("simple", {
      id: text("id").primaryKey(),
    });

    const schema = { simpleTable };

    type NonExistentTable = CustomType<typeof schema, "nonExistent", "id">;
    type NonExistentColumn = CustomType<
      typeof schema,
      "simpleTable",
      "nonExistent"
    >;

    expectTypeOf<NonExistentTable>().toEqualTypeOf<unknown>();
    expectTypeOf<NonExistentColumn>().toEqualTypeOf<unknown>();
  });

  test("works with complex schema from no-config-integration", async () => {
    // Import the actual drizzle schema
    const drizzleSchema = await import("../no-config-integration/drizzle");

    // Test custom type extraction from the user table
    type UserEmail = CustomType<typeof drizzleSchema, "user", "email">;
    type UserName = CustomType<typeof drizzleSchema, "user", "name">;

    // Email has a template string type
    expectTypeOf<UserEmail>().toEqualTypeOf<`${string}@${string}`>();
    // Name is just text with no custom type
    expectTypeOf<UserName>().toEqualTypeOf<string>();
  });

  test("extracts branded/nominal types correctly", () => {
    type UserId = string & { __brand: "UserId" };
    type ProductId = string & { __brand: "ProductId" };

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      userId: text("user_id").$type<UserId>().notNull(),
      productId: text("product_id").$type<ProductId>(),
    });

    const schema = { testTable };

    type ExtractedUserId = CustomType<typeof schema, "testTable", "userId">;
    type ExtractedProductId = CustomType<
      typeof schema,
      "testTable",
      "productId"
    >;

    expectTypeOf<ExtractedUserId>().toEqualTypeOf<UserId>();
    expectTypeOf<ExtractedProductId>().toEqualTypeOf<ProductId>();
  });

  test("handles complex nested union types", () => {
    type Status = "draft" | "published" | "archived";
    type Priority = "low" | "medium" | "high";

    interface ComplexMetadata {
      status: Status;
      priority: Priority;
      tags: string[];
      metadata: {
        createdBy: string;
        modifiedBy?: string;
      };
    }

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      data: jsonb("data").$type<ComplexMetadata>().notNull(),
    });

    const schema = { testTable };

    type ExtractedData = CustomType<typeof schema, "testTable", "data">;

    expectTypeOf<ExtractedData>().toEqualTypeOf<ComplexMetadata>();
  });

  test("extracts types from custom column type with factory", () => {
    type TypeId<T extends string> = string & { __type: T };

    const customTypeIdFactory = <T extends string>() =>
      customType<{
        data: TypeId<T>;
        driverData: string;
        notNull: false;
      }>({
        dataType() {
          return "text";
        },
      });

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      userId: customTypeIdFactory<"user">()("user_id").notNull(),
      orgId: customTypeIdFactory<"org">()("org_id").notNull(),
    });

    const schema = { testTable };

    type ExtractedUserId = CustomType<typeof schema, "testTable", "userId">;
    type ExtractedOrgId = CustomType<typeof schema, "testTable", "orgId">;

    expectTypeOf<ExtractedUserId>().toEqualTypeOf<TypeId<"user">>();
    expectTypeOf<ExtractedOrgId>().toEqualTypeOf<TypeId<"org">>();
  });

  test("handles arrays with custom element types", () => {
    interface Item {
      id: string;
      value: number;
    }

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      items: jsonb("items").$type<Item[]>().notNull(),
      numbers: jsonb("numbers").$type<number[]>(),
      emails: jsonb("emails").$type<`${string}@${string}`[]>(),
    });

    const schema = { testTable };

    type ExtractedItems = CustomType<typeof schema, "testTable", "items">;
    type ExtractedNumbers = CustomType<typeof schema, "testTable", "numbers">;
    type ExtractedEmails = CustomType<typeof schema, "testTable", "emails">;

    expectTypeOf<ExtractedItems>().toEqualTypeOf<Item[]>();
    expectTypeOf<ExtractedNumbers>().toEqualTypeOf<number[]>();
    expectTypeOf<ExtractedEmails>().toEqualTypeOf<`${string}@${string}`[]>();
  });

  test("extracts types from multiple tables in schema", () => {
    interface UserSettings {
      theme: "light" | "dark";
      notifications: boolean;
    }

    interface PostMetadata {
      views: number;
      likes: number;
    }

    const userTable = pgTable("user", {
      id: text("id").primaryKey(),
      settings: jsonb("settings").$type<UserSettings>(),
    });

    const postTable = pgTable("post", {
      id: text("id").primaryKey(),
      metadata: jsonb("metadata").$type<PostMetadata>().notNull(),
      authorId: text("author_id").notNull(),
    });

    const schema = { userTable, postTable };

    type UserSettingsType = CustomType<typeof schema, "userTable", "settings">;
    type PostMetadataType = CustomType<typeof schema, "postTable", "metadata">;
    type AuthorIdType = CustomType<typeof schema, "postTable", "authorId">;

    expectTypeOf<UserSettingsType>().toEqualTypeOf<UserSettings>();
    expectTypeOf<PostMetadataType>().toEqualTypeOf<PostMetadata>();
    expectTypeOf<AuthorIdType>().toEqualTypeOf<string>();
  });

  test("handles varchar with custom type", () => {
    type Email = `${string}@${string}`;

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      email: varchar("email", { length: 255 }).$type<Email>().notNull(),
    });

    const schema = { testTable };

    type ExtractedEmail = CustomType<typeof schema, "testTable", "email">;

    expectTypeOf<ExtractedEmail>().toEqualTypeOf<Email>();
  });

  test("extracts type from integer with custom type", () => {
    type Percentage = number & { __brand: "Percentage" };

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      score: integer("score").$type<Percentage>().notNull(),
      count: integer("count").notNull(),
    });

    const schema = { testTable };

    type ExtractedScore = CustomType<typeof schema, "testTable", "score">;
    type ExtractedCount = CustomType<typeof schema, "testTable", "count">;

    expectTypeOf<ExtractedScore>().toEqualTypeOf<Percentage>();
    expectTypeOf<ExtractedCount>().toEqualTypeOf<number>();
  });

  test("handles boolean columns correctly", () => {
    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      isActive: pgBoolean("is_active").notNull(),
      isDeleted: pgBoolean("is_deleted"),
    });

    const schema = { testTable };

    type ExtractedIsActive = CustomType<typeof schema, "testTable", "isActive">;
    type ExtractedIsDeleted = CustomType<
      typeof schema,
      "testTable",
      "isDeleted"
    >;

    expectTypeOf<ExtractedIsActive>().toEqualTypeOf<boolean>();
    expectTypeOf<ExtractedIsDeleted>().toEqualTypeOf<boolean>();
  });

  test("handles serial columns correctly", () => {
    const testTable = pgTable("test", {
      id: serial("id").primaryKey(),
      count: serial("count").notNull(),
    });

    const schema = { testTable };

    type ExtractedId = CustomType<typeof schema, "testTable", "id">;
    type ExtractedCount = CustomType<typeof schema, "testTable", "count">;

    expectTypeOf<ExtractedId>().toEqualTypeOf<number>();
    expectTypeOf<ExtractedCount>().toEqualTypeOf<number>();
  });

  test("extracts deeply nested interface types", () => {
    interface DeepNested {
      level1: {
        level2: {
          level3: {
            value: string;
            items: Array<{
              id: number;
              data: {
                name: string;
                tags: string[];
              };
            }>;
          };
        };
      };
    }

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      data: jsonb("data").$type<DeepNested>().notNull(),
    });

    const schema = { testTable };

    type ExtractedData = CustomType<typeof schema, "testTable", "data">;

    expectTypeOf<ExtractedData>().toEqualTypeOf<DeepNested>();
  });

  test("handles readonly and optional properties", () => {
    interface ConfigType {
      readonly id: string;
      name: string;
      description?: string;
      readonly metadata?: {
        createdAt: string;
        updatedAt?: string;
      };
    }

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      config: jsonb("config").$type<ConfigType>().notNull(),
    });

    const schema = { testTable };

    type ExtractedConfig = CustomType<typeof schema, "testTable", "config">;

    expectTypeOf<ExtractedConfig>().toEqualTypeOf<ConfigType>();
  });

  test("extracts literal union types correctly", () => {
    type Color = "red" | "green" | "blue";
    type Size = 1 | 2 | 3 | 4 | 5;

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      color: text("color").$type<Color>().notNull(),
      size: integer("size").$type<Size>().notNull(),
    });

    const schema = { testTable };

    type ExtractedColor = CustomType<typeof schema, "testTable", "color">;
    type ExtractedSize = CustomType<typeof schema, "testTable", "size">;

    expectTypeOf<ExtractedColor>().toEqualTypeOf<Color>();
    expectTypeOf<ExtractedSize>().toEqualTypeOf<Size>();
  });

  test("handles Record types correctly", () => {
    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      stringMap: jsonb("string_map").$type<Record<string, string>>().notNull(),
      numberMap: jsonb("number_map").$type<Record<string, number>>(),
      complexMap:
        jsonb("complex_map").$type<
          Record<string, { value: number; label: string }>
        >(),
    });

    const schema = { testTable };

    type ExtractedStringMap = CustomType<
      typeof schema,
      "testTable",
      "stringMap"
    >;
    type ExtractedNumberMap = CustomType<
      typeof schema,
      "testTable",
      "numberMap"
    >;
    type ExtractedComplexMap = CustomType<
      typeof schema,
      "testTable",
      "complexMap"
    >;

    expectTypeOf<ExtractedStringMap>().toEqualTypeOf<Record<string, string>>();
    expectTypeOf<ExtractedNumberMap>().toEqualTypeOf<Record<string, number>>();
    expectTypeOf<ExtractedComplexMap>().toEqualTypeOf<
      Record<string, { value: number; label: string }>
    >();
  });

  test("extracts tuple types correctly", () => {
    type Coordinates = [number, number];
    type RGBColor = [number, number, number];

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      location: jsonb("location").$type<Coordinates>().notNull(),
      color: jsonb("color").$type<RGBColor>(),
    });

    const schema = { testTable };

    type ExtractedLocation = CustomType<typeof schema, "testTable", "location">;
    type ExtractedColor = CustomType<typeof schema, "testTable", "color">;

    expectTypeOf<ExtractedLocation>().toEqualTypeOf<Coordinates>();
    expectTypeOf<ExtractedColor>().toEqualTypeOf<RGBColor>();
  });

  test("handles enum with default value", () => {
    const statusEnum = pgEnum("status", ["active", "inactive", "pending"]);

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      status: statusEnum("status").default("active").notNull(),
      backupStatus: statusEnum("backup_status"),
    });

    const schema = { testTable, statusEnum };

    type ExtractedStatus = CustomType<typeof schema, "testTable", "status">;
    type ExtractedBackupStatus = CustomType<
      typeof schema,
      "testTable",
      "backupStatus"
    >;

    expectTypeOf<ExtractedStatus>().toEqualTypeOf<
      "active" | "inactive" | "pending"
    >();
    expectTypeOf<ExtractedBackupStatus>().toEqualTypeOf<
      "active" | "inactive" | "pending"
    >();
  });

  test("handles columns with defaults correctly", () => {
    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      name: text("name").default("unnamed").notNull(),
      count: integer("count").default(0).notNull(),
      isActive: pgBoolean("is_active").default(true).notNull(),
    });

    const schema = { testTable };

    type ExtractedName = CustomType<typeof schema, "testTable", "name">;
    type ExtractedCount = CustomType<typeof schema, "testTable", "count">;
    type ExtractedIsActive = CustomType<typeof schema, "testTable", "isActive">;

    expectTypeOf<ExtractedName>().toEqualTypeOf<string>();
    expectTypeOf<ExtractedCount>().toEqualTypeOf<number>();
    expectTypeOf<ExtractedIsActive>().toEqualTypeOf<boolean>();
  });

  test("handles intersection types", () => {
    type Base = { id: string; name: string };
    type WithTimestamp = { createdAt: string; updatedAt: string };
    type Entity = Base & WithTimestamp;

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      data: jsonb("data").$type<Entity>().notNull(),
    });

    const schema = { testTable };

    type ExtractedData = CustomType<typeof schema, "testTable", "data">;

    expectTypeOf<ExtractedData>().toEqualTypeOf<Entity>();
  });

  test("extracts type from text column with enum constraint", () => {
    type Role = "admin" | "user" | "guest";

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      role: text("role", { enum: ["admin", "user", "guest"] })
        .$type<Role>()
        .notNull(),
    });

    const schema = { testTable };

    type ExtractedRole = CustomType<typeof schema, "testTable", "role">;

    expectTypeOf<ExtractedRole>().toEqualTypeOf<Role>();
  });

  test("handles optional vs required types correctly", () => {
    interface RequiredData {
      mustHave: string;
      optional?: number;
    }

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      requiredField: jsonb("required").$type<RequiredData>().notNull(),
      optionalField: jsonb("optional").$type<RequiredData>(),
    });

    const schema = { testTable };

    type ExtractedRequired = CustomType<
      typeof schema,
      "testTable",
      "requiredField"
    >;
    type ExtractedOptional = CustomType<
      typeof schema,
      "testTable",
      "optionalField"
    >;

    // Both should extract the same interface type
    expectTypeOf<ExtractedRequired>().toEqualTypeOf<RequiredData>();
    expectTypeOf<ExtractedOptional>().toEqualTypeOf<RequiredData>();
  });

  test("handles generic types", () => {
    interface Container<T> {
      value: T;
      metadata: {
        created: string;
      };
    }

    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      stringContainer: jsonb("string_container")
        .$type<Container<string>>()
        .notNull(),
      numberContainer: jsonb("number_container").$type<Container<number>>(),
    });

    const schema = { testTable };

    type ExtractedStringContainer = CustomType<
      typeof schema,
      "testTable",
      "stringContainer"
    >;
    type ExtractedNumberContainer = CustomType<
      typeof schema,
      "testTable",
      "numberContainer"
    >;

    expectTypeOf<ExtractedStringContainer>().toEqualTypeOf<Container<string>>();
    expectTypeOf<ExtractedNumberContainer>().toEqualTypeOf<Container<number>>();
  });

  test("extracts type from columns with runtime defaults", () => {
    const testTable = pgTable("test", {
      id: text("id").primaryKey(),
      createdAt: text("created_at")
        .notNull()
        .$default(() => new Date().toISOString()),
      optionalDefault: text("optional_default").$default(() =>
        new Date().toISOString(),
      ),
    });

    const schema = { testTable };

    type ExtractedCreatedAt = CustomType<
      typeof schema,
      "testTable",
      "createdAt"
    >;
    type ExtractedOptionalDefault = CustomType<
      typeof schema,
      "testTable",
      "optionalDefault"
    >;

    expectTypeOf<ExtractedCreatedAt>().toEqualTypeOf<string>();
    expectTypeOf<ExtractedOptionalDefault>().toEqualTypeOf<string>();
  });
});
