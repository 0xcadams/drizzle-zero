import {
  boolean,
  enumeration,
  json,
  number,
  string,
  table,
} from "@rocicorp/zero";
import { SQL, sql } from "drizzle-orm";
import { mysqlTable, text as textMysql } from "drizzle-orm/mysql-core";
import {
  bigint,
  bigserial,
  char,
  cidr,
  customType,
  date,
  doublePrecision,
  geometry,
  inet,
  integer,
  interval,
  jsonb,
  line,
  macaddr,
  numeric,
  boolean as pgBoolean,
  pgEnum,
  json as pgJson,
  pgSchema,
  pgTable,
  point,
  primaryKey,
  real,
  serial,
  smallint,
  smallserial,
  text,
  timestamp,
  uuid,
  varchar,
  type Precision,
} from "drizzle-orm/pg-core";
import { describe, test, vi } from "vitest";
import { createZeroTableBuilder, type ColumnsConfig } from "../src";
import { assertEqual, expectTableSchemaDeepEqual } from "./utils";

describe("tables", () => {
  test("pg - basic", () => {
    const testTable = pgTable("test", {
      id: text().primaryKey(),
      name: text().notNull(),
      json: jsonb().notNull(),
    });

    const result = createZeroTableBuilder("basic", testTable, {
      id: true,
      name: true,
      json: true,
    });

    const expected = table("basic")
      .from("test")
      .columns({
        id: string(),
        name: string(),
        json: json(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.name.customType,
      expected.schema.columns.name.customType,
    );
    assertEqual(
      result.schema.columns.json.customType,
      expected.schema.columns.json.customType,
    );
  });

  test("pg - named fields", () => {
    const testTable = pgTable("test", {
      id: text("custom_id").primaryKey(),
      name: text("custom_name").notNull(),
    });

    const result = createZeroTableBuilder("named", testTable, {
      id: true,
      name: true,
    });

    const expected = table("named")
      .from("test")
      .columns({
        id: string().from("custom_id"),
        name: string().from("custom_name"),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.name.customType,
      expected.schema.columns.name.customType,
    );
  });

  test("pg - custom types", () => {
    const testTable = pgTable("test", {
      id: text().primaryKey(),
      json: jsonb().$type<{ foo: string }>().notNull(),
    });

    const result = createZeroTableBuilder("custom", testTable, {
      id: string(),
      json: true,
    });

    const expected = table("custom")
      .from("test")
      .columns({
        id: string(),
        json: json<{ foo: string }>(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.json.customType,
      expected.schema.columns.json.customType,
    );
  });

  test("pg - optional fields", () => {
    const testTable = pgTable("test", {
      id: text().primaryKey(),
      name: text(), // optional
      description: text(), // optional
      metadata: jsonb(), // optional
    });

    const result = createZeroTableBuilder("optional", testTable, {
      id: true,
      name: true,
      description: true,
      metadata: true,
    });

    const expected = table("optional")
      .from("test")
      .columns({
        id: string(),
        name: string().optional(),
        description: string().optional(),
        metadata: json().optional(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.name.customType,
      expected.schema.columns.name.customType,
    );
    assertEqual(
      result.schema.columns.description.customType,
      expected.schema.columns.description.customType,
    );
    assertEqual(
      result.schema.columns.metadata.customType,
      expected.schema.columns.metadata.customType,
    );
  });

  test("pg - complex custom types", () => {
    type UserMetadata = {
      preferences: {
        theme: "light" | "dark";
        notifications: boolean;
      };
      lastLogin: string;
    };

    const testTable = pgTable("users", {
      id: text().$type<`${string}-${string}`>().primaryKey(),
      metadata: jsonb().$type<UserMetadata>().notNull(),
      settings: jsonb().$type<Record<string, boolean>>(),
      status: text("status", { enum: ["ASSIGNED", "COMPLETED"] }),
    });

    const result = createZeroTableBuilder("complex", testTable, {
      id: true,
      metadata: true,
      settings: true,
      status: true,
    });

    const expected = table("complex")
      .from("users")
      .columns({
        id: string<`${string}-${string}`>(),
        metadata: json<UserMetadata>(),
        settings: json<Record<string, boolean>>().optional(),
        status: string<"ASSIGNED" | "COMPLETED">().optional(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.metadata.customType,
      expected.schema.columns.metadata.customType,
    );
    assertEqual(
      result.schema.columns.settings.customType,
      expected.schema.columns.settings.customType,
    );
    assertEqual(
      result.schema.columns.status.customType,
      expected.schema.columns.status.customType,
    );
  });

  test("pg - custom column type", () => {
    const customColumnType = customType<{
      data: Date;
      driverData: string;
      config: { precision: Precision; withTimezone: boolean };
    }>({
      dataType(config) {
        const precision = config !== undefined ? ` (${config.precision})` : "";
        const timezone =
          config !== undefined
            ? config.withTimezone
              ? " with time zone"
              : " without time zone"
            : "";

        return `timestamp${precision}${timezone}`;
      },
      fromDriver(value: string): Date {
        return new Date(value);
      },
      toDriver(value: Date | SQL): string | SQL {
        if (value && "toISOString" in value) {
          return value.toISOString();
        }
        return value;
      },
    });

    const testTable = pgTable("users", {
      id: text().primaryKey(),
      createdAt: customColumnType("created_at").notNull(),
    });

    const result = createZeroTableBuilder("custom_column_type", testTable, {
      id: true,
      createdAt: number().from("created_at"),
    });

    const expected = table("custom_column_type")
      .from("users")
      .columns({
        id: string(),
        createdAt: number().from("created_at"),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.createdAt.customType,
      expected.schema.columns.createdAt.customType,
    );
  });

  test("pg - partial column selection", () => {
    const testTable = pgTable("test", {
      id: text().primaryKey(),
      name: text().notNull(),
      age: serial().notNull(),
      metadata: jsonb().notNull(),
    });

    const result = createZeroTableBuilder("partial", testTable, {
      id: true,
      metadata: true,
      name: false,
      age: false,
    });

    const expected = table("partial")
      .from("test")
      .columns({
        id: string(),
        metadata: json(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
  });

  test("pg - partial column selection with omit", () => {
    const testTable = pgTable("test", {
      id: text().primaryKey(),
      name: text().notNull(),
      age: serial().notNull(),
      metadata: jsonb().notNull(),
    });

    const result = createZeroTableBuilder("omit", testTable, {
      id: true,
      name: true,
    });

    const expected = table("omit")
      .from("test")
      .columns({
        id: string(),
        name: string(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
  });

  test("pg - partial column selection with omit primary key", () => {
    const testTable = pgTable("test", {
      id: text().primaryKey(),
      name: text().notNull(),
      age: serial().notNull(),
      metadata: jsonb().notNull(),
    });

    const result = createZeroTableBuilder("omit", testTable, {
      metadata: true,
    });

    const expected = table("omit")
      .from("test")
      .columns({
        id: string(),
        metadata: json(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.metadata.customType,
      expected.schema.columns.metadata.customType,
    );
  });

  test("pg - partial column selection with false", () => {
    const testTable = pgTable("test", {
      id: text().primaryKey(),
      name: text().notNull(),
      age: serial().notNull(),
      metadata: jsonb().notNull(),
    });

    const result = createZeroTableBuilder("false", testTable, {
      id: true,
      metadata: true,
      age: false,
      name: false,
    });

    const expected = table("false")
      .from("test")
      .columns({
        id: string(),
        metadata: json(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.metadata.customType,
      expected.schema.columns.metadata.customType,
    );
  });

  test("pg - no column selection", () => {
    const testTable = pgTable("test", {
      id: text().primaryKey(),
      name: text().notNull(),
      age: integer().notNull(),
      metadata: jsonb().notNull(),
    });

    const result = createZeroTableBuilder("no-columns", testTable, true);

    const expected = table("no-columns")
      .from("test")
      .columns({
        id: string(),
        name: string(),
        age: number(),
        metadata: json(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
  });

  test("pg - undefined column selection", () => {
    const testTable = pgTable("test", {
      id: text().primaryKey(),
      name: text().notNull(),
      age: integer().notNull(),
      metadata: jsonb().notNull(),
    });

    const result = createZeroTableBuilder("no-columns", testTable);

    const expected = table("no-columns")
      .from("test")
      .columns({
        id: string(),
        name: string(),
        age: number(),
        metadata: json(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.name.customType,
      expected.schema.columns.name.customType,
    );
    assertEqual(
      result.schema.columns.age.customType,
      expected.schema.columns.age.customType,
    );
    assertEqual(
      result.schema.columns.metadata.customType,
      expected.schema.columns.metadata.customType,
    );
  });

  test("pg - composite primary key", () => {
    const testTable = pgTable(
      "composite_test",
      {
        userId: text().notNull(),
        orgId: text().notNull(),
        // there is a known issue with the text column type - if there are multiple primary key columns, the type
        // will be inferred as all of the text column types, not just the primary key columns.
        enabled: pgBoolean().notNull(),
      },
      (t) => [primaryKey({ columns: [t.userId, t.orgId] })],
    );

    const result = createZeroTableBuilder("composite", testTable, {
      userId: true,
      orgId: true,
      enabled: true,
    });

    const expected = table("composite")
      .from("composite_test")
      .columns({
        userId: string(),
        orgId: string(),
        enabled: boolean(),
      })
      .primaryKey("userId", "orgId");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.userId.customType,
      expected.schema.columns.userId.customType,
    );
    assertEqual(
      result.schema.columns.orgId.customType,
      expected.schema.columns.orgId.customType,
    );
    assertEqual(
      result.schema.columns.enabled.customType,
      expected.schema.columns.enabled.customType,
    );
  });

  test("pg - timestamp fields", () => {
    const testTable = pgTable("events", {
      id: text().primaryKey(),
      createdAt: timestamp().notNull().defaultNow(),
      updatedAt: timestamp(),
      scheduledFor: timestamp().notNull(),
      scheduledForTz: timestamp({ withTimezone: true }),
      precision: timestamp({ precision: 2 }),
      timestampModeString: timestamp({ mode: "string" }),
      timestampModeDate: timestamp({ mode: "date" }),
      timestampDefault: timestamp("timestamp_default", {
        mode: "string",
        precision: 3,
        withTimezone: true,
      })
        .defaultNow()
        .notNull()
        .$onUpdate(() => sql`now()`),
    });

    const result = createZeroTableBuilder("events", testTable, {
      id: true,
      createdAt: true,
      updatedAt: true,
      scheduledFor: true,
      scheduledForTz: true,
      precision: true,
      timestampModeString: true,
      timestampModeDate: true,
      timestampDefault: true,
    });

    const expected = table("events")
      .columns({
        id: string(),
        createdAt: number().optional(),
        updatedAt: number().optional(),
        scheduledFor: number(),
        scheduledForTz: number().optional(),
        precision: number().optional(),
        timestampModeString: number().optional(),
        timestampModeDate: number().optional(),
        timestampDefault: number().from("timestamp_default").optional(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.createdAt.customType,
      expected.schema.columns.createdAt.customType,
    );
    assertEqual(
      result.schema.columns.updatedAt.customType,
      expected.schema.columns.updatedAt.customType,
    );
    assertEqual(
      result.schema.columns.scheduledFor.customType,
      expected.schema.columns.scheduledFor.customType,
    );
    assertEqual(
      result.schema.columns.scheduledForTz.customType,
      expected.schema.columns.scheduledForTz.customType,
    );
    assertEqual(
      result.schema.columns.precision.customType,
      expected.schema.columns.precision.customType,
    );
    assertEqual(
      result.schema.columns.timestampModeString.customType,
      expected.schema.columns.timestampModeString.customType,
    );
    assertEqual(
      result.schema.columns.timestampModeDate.customType,
      expected.schema.columns.timestampModeDate.customType,
    );
    assertEqual(
      result.schema.columns.timestampDefault.customType,
      expected.schema.columns.timestampDefault.customType,
    );
  });

  test("pg - custom column mapping", () => {
    const testTable = pgTable("users", {
      id: text().primaryKey(),
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      profileData: jsonb("profile_data").$type<{
        bio: string;
        avatar: string;
      }>(),
    });

    const result = createZeroTableBuilder("users", testTable, {
      id: true,
      firstName: true,
      lastName: true,
      profileData: true,
    });

    const expected = table("users")
      .columns({
        id: string(),
        firstName: string().from("first_name"),
        lastName: string().from("last_name"),
        profileData: json<{ bio: string; avatar: string }>()
          .from("profile_data")
          .optional(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.firstName.customType,
      expected.schema.columns.firstName.customType,
    );
    assertEqual(
      result.schema.columns.lastName.customType,
      expected.schema.columns.lastName.customType,
    );
    assertEqual(
      result.schema.columns.profileData.customType,
      expected.schema.columns.profileData.customType,
    );
  });

  test("pg - enum field", () => {
    const roleEnum = pgEnum("user_role", ["admin", "user", "guest"]);

    const testTable = pgTable("users", {
      id: text().primaryKey(),
      role: roleEnum().notNull(),
      roleWithDefault: roleEnum().default("user").notNull(),
      backupRole: roleEnum(),
    });

    const result = createZeroTableBuilder("enum", testTable, {
      id: true,
      role: true,
      roleWithDefault: true,
      backupRole: true,
    });

    const expected = table("enum")
      .from("users")
      .columns({
        id: string(),
        role: enumeration<"admin" | "user" | "guest">(),
        roleWithDefault: enumeration<"admin" | "user" | "guest">().optional(),
        backupRole: enumeration<"admin" | "user" | "guest">().optional(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.role.customType,
      expected.schema.columns.role.customType,
    );
    assertEqual(
      result.schema.columns.roleWithDefault.customType,
      expected.schema.columns.roleWithDefault.customType,
    );
    assertEqual(
      result.schema.columns.backupRole.customType,
      expected.schema.columns.backupRole.customType,
    );
  });

  test("pg - simple enum field", () => {
    const moodEnum = pgEnum("mood_type", ["happy", "sad", "ok"]);

    const testTable = pgTable("users", {
      id: text().primaryKey(),
      name: text().notNull(),
      mood: moodEnum().notNull(),
    });

    const result = createZeroTableBuilder("users", testTable, {
      id: true,
      name: true,
      mood: true,
    });

    const expected = table("users")
      .columns({
        id: string(),
        name: string(),
        mood: enumeration<"happy" | "sad" | "ok">(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.name.customType,
      expected.schema.columns.name.customType,
    );
    assertEqual(
      result.schema.columns.mood.customType,
      expected.schema.columns.mood.customType,
    );
  });

  test("pg - all supported data types", () => {
    const statusEnum = pgEnum("status_type", ["active", "inactive", "pending"]);

    const testTable = pgTable("all_types", {
      // Integer types
      id: text("id").primaryKey(),
      smallint: smallint("smallint").notNull(),
      integer: integer("integer").notNull(),
      bigint: bigint("bigint", { mode: "bigint" }).notNull(),
      bigint_number: bigint("bigint_number", { mode: "number" }).notNull(),

      // Serial types
      smallSerial: smallserial("smallserial").notNull(),
      regularSerial: serial("regular_serial").notNull(),
      bigSerial: bigserial("bigserial", { mode: "number" }).notNull(),

      // Arbitrary precision types
      numeric: numeric("numeric", { precision: 10, scale: 2 }).notNull(),
      decimal: numeric("decimal", { precision: 10, scale: 2 }).notNull(),

      // Floating-point types
      real: real("real").notNull(),
      doublePrecision: doublePrecision("double_precision").notNull(),

      // String types
      name: text().notNull(),
      code: char().notNull(),
      identifier: uuid().notNull(),
      description: varchar().notNull(),
      isActive: pgBoolean().notNull(),
      createdAt: timestamp().notNull(),
      updatedAt: timestamp({ withTimezone: true }).notNull(),
      birthDate: date().notNull(),
      dateString: date({ mode: "string" }).notNull(),
      metadata: jsonb().notNull(),
      settings: pgJson().$type<{ theme: string; fontSize: number }>().notNull(),
      status: statusEnum().notNull(),

      // Optional variants
      optionalSmallint: smallint("optional_smallint"),
      optionalInteger: integer("optional_integer"),
      optionalBigint: bigint("optional_bigint", { mode: "number" }),
      optionalNumeric: numeric("optional_numeric", { precision: 10, scale: 2 }),
      optionalDecimal: numeric("optional_decimal", { precision: 10, scale: 2 }),
      optionalReal: real("optional_real"),
      optionalDoublePrecision: doublePrecision("optional_double_precision"),
      optionalText: text("optional_text"),
      optionalBoolean: pgBoolean("optional_boolean"),
      optionalTimestamp: timestamp("optional_timestamp"),
      optionalDate: date("optional_date"),
      optionalJson: jsonb("optional_json"),
      optionalEnum: statusEnum("optional_enum"),
    });

    const result = createZeroTableBuilder("all_types", testTable, {
      id: true,
      smallint: true,
      integer: true,
      bigint: true,
      bigint_number: true,
      smallSerial: true,
      regularSerial: true,
      bigSerial: true,
      numeric: true,
      decimal: true,
      real: true,
      doublePrecision: true,
      name: true,
      code: true,
      identifier: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      birthDate: true,
      dateString: true,
      metadata: true,
      settings: true,
      status: true,
      optionalSmallint: true,
      optionalInteger: true,
      optionalBigint: true,
      optionalNumeric: true,
      optionalDecimal: true,
      optionalReal: true,
      optionalDoublePrecision: true,
      optionalText: true,
      optionalBoolean: true,
      optionalTimestamp: true,
      optionalDate: true,
      optionalJson: true,
      optionalEnum: true,
    });

    const expected = table("all_types")
      .columns({
        id: string(),
        smallint: number(),
        integer: number(),
        bigint: number(),
        bigint_number: number(),
        smallSerial: number().from("smallserial").optional(),
        regularSerial: number().from("regular_serial").optional(),
        bigSerial: number().from("bigserial").optional(),
        numeric: number(),
        decimal: number(),
        real: number(),
        doublePrecision: number().from("double_precision"),
        name: string(),
        code: string(),
        identifier: string(),
        description: string(),
        isActive: boolean(),
        createdAt: number(),
        updatedAt: number(),
        birthDate: number(),
        dateString: number(),
        metadata: json(),
        settings: json<{ theme: string; fontSize: number }>(),
        status: enumeration<"active" | "inactive" | "pending">(),
        optionalSmallint: number().optional().from("optional_smallint"),
        optionalInteger: number().optional().from("optional_integer"),
        optionalBigint: number().optional().from("optional_bigint"),
        optionalNumeric: number().optional().from("optional_numeric"),
        optionalDecimal: number().optional().from("optional_decimal"),
        optionalReal: number().optional().from("optional_real"),
        optionalDoublePrecision: number()
          .optional()
          .from("optional_double_precision"),
        optionalText: string().optional().from("optional_text"),
        optionalBoolean: boolean().optional().from("optional_boolean"),
        optionalTimestamp: number().optional().from("optional_timestamp"),
        optionalDate: number().optional().from("optional_date"),
        optionalJson: json().optional().from("optional_json"),
        optionalEnum: enumeration<"active" | "inactive" | "pending">()
          .optional()
          .from("optional_enum"),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.smallint.customType,
      expected.schema.columns.smallint.customType,
    );
    assertEqual(
      result.schema.columns.integer.customType,
      expected.schema.columns.integer.customType,
    );
    assertEqual(
      result.schema.columns.bigint.customType,
      expected.schema.columns.bigint.customType,
    );
    assertEqual(
      result.schema.columns.bigint_number.customType,
      expected.schema.columns.bigint_number.customType,
    );
    assertEqual(
      result.schema.columns.smallSerial.customType,
      expected.schema.columns.smallSerial.customType,
    );
    assertEqual(
      result.schema.columns.regularSerial.customType,
      expected.schema.columns.regularSerial.customType,
    );
    assertEqual(
      result.schema.columns.bigSerial.customType,
      expected.schema.columns.bigSerial.customType,
    );
    assertEqual(
      result.schema.columns.numeric.customType,
      expected.schema.columns.numeric.customType,
    );
    assertEqual(
      result.schema.columns.decimal.customType,
      expected.schema.columns.decimal.customType,
    );
    assertEqual(
      result.schema.columns.real.customType,
      expected.schema.columns.real.customType,
    );
    assertEqual(
      result.schema.columns.doublePrecision.customType,
      expected.schema.columns.doublePrecision.customType,
    );
    assertEqual(
      result.schema.columns.name.customType,
      expected.schema.columns.name.customType,
    );
    assertEqual(
      result.schema.columns.code.customType,
      expected.schema.columns.code.customType,
    );
    assertEqual(
      result.schema.columns.identifier.customType,
      expected.schema.columns.identifier.customType,
    );
    assertEqual(
      result.schema.columns.description.customType,
      expected.schema.columns.description.customType,
    );
    assertEqual(
      result.schema.columns.isActive.customType,
      expected.schema.columns.isActive.customType,
    );
    assertEqual(
      result.schema.columns.createdAt.customType,
      expected.schema.columns.createdAt.customType,
    );
    assertEqual(
      result.schema.columns.updatedAt.customType,
      expected.schema.columns.updatedAt.customType,
    );
    assertEqual(
      result.schema.columns.birthDate.customType,
      expected.schema.columns.birthDate.customType,
    );
    assertEqual(
      result.schema.columns.dateString.customType,
      expected.schema.columns.dateString.customType,
    );
    assertEqual(
      result.schema.columns.metadata.customType,
      expected.schema.columns.metadata.customType,
    );
    assertEqual(
      result.schema.columns.settings.customType,
      expected.schema.columns.settings.customType,
    );
    assertEqual(
      result.schema.columns.status.customType,
      expected.schema.columns.status.customType,
    );
    assertEqual(
      result.schema.columns.optionalSmallint.customType,
      expected.schema.columns.optionalSmallint.customType,
    );
    assertEqual(
      result.schema.columns.optionalInteger.customType,
      expected.schema.columns.optionalInteger.customType,
    );
    assertEqual(
      result.schema.columns.optionalBigint.customType,
      expected.schema.columns.optionalBigint.customType,
    );
    assertEqual(
      result.schema.columns.optionalNumeric.customType,
      expected.schema.columns.optionalNumeric.customType,
    );
    assertEqual(
      result.schema.columns.optionalDecimal.customType,
      expected.schema.columns.optionalDecimal.customType,
    );
    assertEqual(
      result.schema.columns.optionalReal.customType,
      expected.schema.columns.optionalReal.customType,
    );
    assertEqual(
      result.schema.columns.optionalDoublePrecision.customType,
      expected.schema.columns.optionalDoublePrecision.customType,
    );
    assertEqual(
      result.schema.columns.optionalText.customType,
      expected.schema.columns.optionalText.customType,
    );
    assertEqual(
      result.schema.columns.optionalBoolean.customType,
      expected.schema.columns.optionalBoolean.customType,
    );
    assertEqual(
      result.schema.columns.optionalTimestamp.customType,
      expected.schema.columns.optionalTimestamp.customType,
    );
    assertEqual(
      result.schema.columns.optionalDate.customType,
      expected.schema.columns.optionalDate.customType,
    );
    assertEqual(
      result.schema.columns.optionalJson.customType,
      expected.schema.columns.optionalJson.customType,
    );
    assertEqual(
      result.schema.columns.optionalEnum.customType,
      expected.schema.columns.optionalEnum.customType,
    );
  });

  test("pg - override column json type", () => {
    const testTable = pgTable("metrics", {
      id: text().primaryKey(),
      metadata: jsonb().notNull(),
    });

    const result = createZeroTableBuilder("override", testTable, {
      id: true,
      metadata: json<{ amount: number; currency: string }>().optional(),
    });

    const expected = table("override")
      .from("metrics")
      .columns({
        id: string(),
        metadata: json<{ amount: number; currency: string }>().optional(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.metadata.customType,
      expected.schema.columns.metadata.customType,
    );
  });

  test("pg - snake case", () => {
    const testTable = pgTable("users", {
      id: text().primaryKey(),
      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
    });

    const result = createZeroTableBuilder(
      "users",
      testTable,
      {
        id: true,
        createdAt: true,
        updatedAt: true,
      },
      false,
      "snake_case",
    );

    const expected = table("users")
      .columns({
        id: string(),
        createdAt: number().from("created_at"),
        updatedAt: number().from("updated_at"),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.createdAt.customType,
      expected.schema.columns.createdAt.customType,
    );
    assertEqual(
      result.schema.columns.updatedAt.customType,
      expected.schema.columns.updatedAt.customType,
    );
  });

  test("pg - compound primary key", () => {
    const testTable = pgTable(
      "order_items",
      {
        orderId: text("order_id").notNull(),
        productId: text("product_id").notNull(),
        quantity: integer().notNull(),
        price: numeric().notNull(),
      },
      (t) => [primaryKey({ columns: [t.orderId, t.productId] })],
    );

    const result = createZeroTableBuilder("order_items", testTable, {
      orderId: true,
      productId: true,
      quantity: true,
      price: true,
    });

    const expected = table("order_items")
      .columns({
        orderId: string().from("order_id"),
        productId: string().from("product_id"),
        quantity: number(),
        price: number(),
      })
      .primaryKey("orderId", "productId");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.orderId.customType,
      expected.schema.columns.orderId.customType,
    );
    assertEqual(
      result.schema.columns.productId.customType,
      expected.schema.columns.productId.customType,
    );
    assertEqual(
      result.schema.columns.quantity.customType,
      expected.schema.columns.quantity.customType,
    );
    assertEqual(
      result.schema.columns.price.customType,
      expected.schema.columns.price.customType,
    );
  });

  test("pg - default values", () => {
    const testTable = pgTable("items", {
      id: text().primaryKey(),
      name: text().notNull().default("unnamed"),
      isActive: pgBoolean().notNull().default(true),
      score: integer().notNull().default(0),
      optionalScore: integer().default(0),
      currentDateWithRuntimeDefault: text()
        .notNull()
        .$default(() => new Date().toISOString()),
      optionalCurrentDateWithRuntimeDefault: text().$default(() =>
        new Date().toISOString(),
      ),
    });

    const result = createZeroTableBuilder("items", testTable, {
      id: true,
      name: true,
      isActive: true,
      score: true,
      optionalScore: true,
      currentDateWithRuntimeDefault: true,
      optionalCurrentDateWithRuntimeDefault: true,
    });

    const expected = table("items")
      .columns({
        id: string(),
        name: string().optional(),
        isActive: boolean().optional(),
        score: number().optional(),
        optionalScore: number().optional(),
        currentDateWithRuntimeDefault: string(),
        optionalCurrentDateWithRuntimeDefault: string().optional(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.name.customType,
      expected.schema.columns.name.customType,
    );
    assertEqual(
      result.schema.columns.isActive.customType,
      expected.schema.columns.isActive.customType,
    );
    assertEqual(
      result.schema.columns.score.customType,
      expected.schema.columns.score.customType,
    );
    assertEqual(
      result.schema.columns.optionalScore.customType,
      expected.schema.columns.optionalScore.customType,
    );
    assertEqual(
      result.schema.columns.currentDateWithRuntimeDefault.customType,
      expected.schema.columns.currentDateWithRuntimeDefault.customType,
    );
    assertEqual(
      result.schema.columns.optionalCurrentDateWithRuntimeDefault.customType,
      expected.schema.columns.optionalCurrentDateWithRuntimeDefault.customType,
    );
  });

  test("pg - mixed required and optional json fields", () => {
    type ComplexMetadata = {
      required: {
        features: string[];
      };
      optional?: {
        preferences: Record<string, string>;
        lastAccessed?: string;
      };
    };

    const testTable = pgTable("configs", {
      id: text().primaryKey(),
      requiredJson: jsonb().$type<{ key: string }>().notNull(),
      optionalJson: jsonb().$type<ComplexMetadata>(),
      mixedJson: pgJson()
        .$type<{ required: number; optional?: string }>()
        .notNull(),
    });

    const result = createZeroTableBuilder("configs", testTable, {
      id: true,
      requiredJson: true,
      optionalJson: true,
      mixedJson: true,
    });

    const expected = table("configs")
      .columns({
        id: string(),
        requiredJson: json<{ key: string }>(),
        optionalJson: json<ComplexMetadata>().optional(),
        mixedJson: json<{ required: number; optional?: string }>(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.requiredJson.customType,
      expected.schema.columns.requiredJson.customType,
    );
    assertEqual(
      result.schema.columns.optionalJson.customType,
      expected.schema.columns.optionalJson.customType,
    );
    assertEqual(
      result.schema.columns.mixedJson.customType,
      expected.schema.columns.mixedJson.customType,
    );
  });

  test("pg - custom column selection with type overrides", () => {
    const testTable = pgTable("products", {
      id: text().primaryKey(),
      name: text().notNull(),
      description: text(),
      metadata: jsonb().$type<Record<string, unknown>>(),
    });

    const result = createZeroTableBuilder("products", testTable, {
      id: true,
      name: string<"typed-value">(),
      description: string<"typed-value-2">().optional(),
      metadata: json<{ category: string; tags: string[] }>().optional(),
    });

    const expected = table("products")
      .columns({
        id: string(),
        name: string<"typed-value">(),
        description: string<"typed-value-2">().optional(),
        metadata: json<{ category: string; tags: string[] }>().optional(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.name.customType,
      expected.schema.columns.name.customType,
    );
    assertEqual(
      result.schema.columns.description.customType,
      expected.schema.columns.description.customType,
    );
    assertEqual(
      result.schema.columns.metadata.customType,
      expected.schema.columns.metadata.customType,
    );
  });

  test("pg - override enum column", () => {
    const enumType = pgEnum("status", ["active", "inactive", "pending"]);

    const testTable = pgTable("products", {
      id: text().primaryKey(),
      status: enumType("enum_status").notNull(),
    });

    const result = createZeroTableBuilder("products", testTable, {
      id: true,
      status: enumeration<"active" | "inactive">().from("enum_status"),
    });

    const expected = table("products")
      .columns({
        id: string(),
        status: enumeration<"active" | "inactive">().from("enum_status"),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.status.customType,
      expected.schema.columns.status.customType,
    );
  });

  test("pg - custom schema", () => {
    const customSchema = pgSchema("schema1");

    const testTable = customSchema.table("customer", {
      id: text().primaryKey(),
      name: text().notNull(),
    });

    const result = createZeroTableBuilder("customKey", testTable, {
      id: true,
      name: true,
    });

    const expected = table("customKey")
      .from("schema1.customer")
      .columns({
        id: string(),
        name: string(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.name.customType,
      expected.schema.columns.name.customType,
    );
  });

  test("pg - custom schema with override", () => {
    const customSchema = pgSchema("custom_schema");

    const testTable = customSchema.table("products", {
      id: text("custom_id").primaryKey(),
      name: text("custom_name").notNull(),
    });

    const result = createZeroTableBuilder("testTable", testTable, {
      id: true,
      name: string<"new-name">(),
    });

    const expected = table("testTable")
      .from("custom_schema.products")
      .columns({
        id: string().from("custom_id"),
        name: string<"new-name">(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.name.customType,
      expected.schema.columns.name.customType,
    );
  });

  test("pg - custom schema with from", () => {
    const customSchema = pgSchema("custom_schema");

    const testTable = customSchema.table("products", {
      id: text("custom_id").primaryKey(),
      name: text("custom_name").notNull(),
    });

    const result = createZeroTableBuilder("testTable", testTable, {
      id: true,
      name: true,
    });

    const expected = table("testTable")
      .from("custom_schema.products")
      .columns({
        id: string().from("custom_id"),
        name: string().from("custom_name"),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.name.customType,
      expected.schema.columns.name.customType,
    );
  });

  test("pg - column name conversion with explicit names", () => {
    // Create a table with explicit snake_case column names
    const testTable = pgTable("snake_case_table", {
      id: text("user_id").primaryKey(),
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      createdAt: timestamp("created_at").notNull(),
      updatedAt: timestamp("updated_at"),
    });

    const result = createZeroTableBuilder(
      "camel_conversion",
      testTable,
      {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
      false,
      "camelCase",
    );

    const expected = table("camel_conversion")
      .from("snake_case_table")
      .columns({
        id: string().from("user_id"),
        firstName: string().from("first_name"),
        lastName: string().from("last_name"),
        createdAt: number().from("created_at"),
        updatedAt: number().from("updated_at").optional(),
      })
      .primaryKey("id");

    expectTableSchemaDeepEqual(result.build()).toEqual(expected.build());
    assertEqual(
      result.schema.columns.id.customType,
      expected.schema.columns.id.customType,
    );
    assertEqual(
      result.schema.columns.firstName.customType,
      expected.schema.columns.firstName.customType,
    );
    assertEqual(
      result.schema.columns.lastName.customType,
      expected.schema.columns.lastName.customType,
    );
    assertEqual(
      result.schema.columns.createdAt.customType,
      expected.schema.columns.createdAt.customType,
    );
    assertEqual(
      result.schema.columns.updatedAt.customType,
      expected.schema.columns.updatedAt.customType,
    );
  });

  test("pg - invalid column type", ({ expect }) => {
    const testTable = pgTable("test", {
      id: text().primaryKey(),
      invalid: text().notNull(),
    });

    expect(() =>
      createZeroTableBuilder("test", testTable, {
        id: true,
        invalid: "someinvalidtype",
      } as unknown as ColumnsConfig<typeof testTable>),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: drizzle-zero: Invalid column config for column invalid - expected boolean or ColumnBuilder but was string]`,
    );
  });

  test("pg - invalid column selection", ({ expect }) => {
    const testTable = pgTable("test", {
      id: text().primaryKey(),
      invalid: text().notNull(),
    });

    expect(() =>
      createZeroTableBuilder("test", testTable, {
        id: true,
        invalid: "someinvalidtype",
      } as unknown as ColumnsConfig<typeof testTable>),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: drizzle-zero: Invalid column config for column invalid - expected boolean or ColumnBuilder but was string]`,
    );
  });

  test("pg - array types", ({ expect }) => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const testTable = pgTable("test", {
      id: text().primaryKey(),
      tags: text().array().notNull(),
      scores: jsonb().array(),
    });

    createZeroTableBuilder("test", testTable, {
      id: true,
      tags: true,
      scores: true,
    });

    // Should warn about unsupported array types but not throw
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "🚨  drizzle-zero: Unsupported column type: tags - PgArray (array)",
      ),
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "🚨  drizzle-zero: Unsupported column type: scores - PgArray (array)",
      ),
    );

    consoleSpy.mockRestore();
  });

  test("pg - interval types", ({ expect }) => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const testTable = pgTable("test", {
      id: text().primaryKey(),
      interval: interval().notNull(),
    });

    createZeroTableBuilder("test", testTable, {
      id: true,
      interval: true,
    });

    // Should warn about unsupported interval types but not throw
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "🚨  drizzle-zero: Unsupported column type: interval - PgInterval (string)",
      ),
    );

    consoleSpy.mockRestore();
  });

  test("pg - cidr types", ({ expect }) => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const testTable = pgTable("test", {
      id: text().primaryKey(),
      cidr: cidr().notNull(),
    });

    createZeroTableBuilder("test", testTable, {
      id: true,
      cidr: true,
    });

    // Should warn about unsupported cidr types but not throw
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "🚨  drizzle-zero: Unsupported column type: cidr - PgCidr (string)",
      ),
    );

    consoleSpy.mockRestore();
  });

  test("pg - macaddr types", ({ expect }) => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const testTable = pgTable("test", {
      id: text().primaryKey(),
      macaddr: macaddr().notNull(),
    });

    createZeroTableBuilder("test", testTable, {
      id: true,
      macaddr: true,
    });

    // Should warn about unsupported macaddr types but not throw
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "🚨  drizzle-zero: Unsupported column type: macaddr - PgMacaddr (string)",
      ),
    );

    consoleSpy.mockRestore();
  });

  test("pg - inet types", ({ expect }) => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const testTable = pgTable("test", {
      id: text().primaryKey(),
      inet: inet().notNull(),
    });

    createZeroTableBuilder("test", testTable, {
      id: true,
      inet: true,
    });

    // Should warn about unsupported inet types but not throw
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "🚨  drizzle-zero: Unsupported column type: inet - PgInet (string)",
      ),
    );

    consoleSpy.mockRestore();
  });

  test("pg - point types", ({ expect }) => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const testTable = pgTable("test", {
      id: text().primaryKey(),
      point: point().notNull(),
    });

    createZeroTableBuilder("test", testTable, {
      id: true,
      point: true,
    });

    // Should warn about unsupported point types but not throw
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "🚨  drizzle-zero: Unsupported column type: point - PgPointTuple (array)",
      ),
    );

    consoleSpy.mockRestore();
  });

  test("pg - line types", ({ expect }) => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const testTable = pgTable("test", {
      id: text().primaryKey(),
      line: line().notNull(),
    });

    createZeroTableBuilder("test", testTable, {
      id: true,
      line: true,
    });

    // Should warn about unsupported line types but not throw
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "🚨  drizzle-zero: Unsupported column type: line - PgLine (array)",
      ),
    );

    consoleSpy.mockRestore();
  });

  test("pg - geometry types", ({ expect }) => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const testTable = pgTable("test", {
      id: text().primaryKey(),
      location: geometry("location", {
        type: "point",
        mode: "xy",
        srid: 4326,
      }).notNull(),
    });

    createZeroTableBuilder("test", testTable, {
      id: true,
      location: true,
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "🚨  drizzle-zero: Unsupported column type: location - PgGeometryObject (json)",
      ),
    );

    consoleSpy.mockRestore();
  });

  test("pg - no primary key", ({ expect }) => {
    const testTable = pgTable("test", {
      id: text(),
    });

    expect(() =>
      createZeroTableBuilder("test", testTable, {
        id: true,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: drizzle-zero: No primary keys found in table - test. Did you forget to define a primary key?]`,
    );
  });

  test("pg - fail if table is not pg", ({ expect }) => {
    const testTable = mysqlTable("test", {
      id: textMysql().primaryKey(),
      name: textMysql(),
    });

    expect(() =>
      createZeroTableBuilder("test", testTable, {
        id: true,
        name: true,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: drizzle-zero: Unsupported table type: test. Only Postgres tables are supported.]`,
    );
  });
});
