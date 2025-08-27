CREATE TYPE "public"."status_type" AS ENUM('active', 'inactive', 'pending');--> statement-breakpoint
CREATE TABLE "all_types" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"smallint" smallint NOT NULL,
	"integer" integer NOT NULL,
	"bigint" bigint NOT NULL,
	"bigint_number" bigint NOT NULL,
	"smallserial" "smallserial" NOT NULL,
	"serial" serial NOT NULL,
	"bigserial" bigserial NOT NULL,
	"numeric" numeric(10, 2) NOT NULL,
	"decimal" numeric(10, 2) NOT NULL,
	"real" real NOT NULL,
	"double_precision" double precision NOT NULL,
	"text" text NOT NULL,
	"char" char NOT NULL,
	"uuid" uuid NOT NULL,
	"varchar" varchar NOT NULL,
	"boolean" boolean NOT NULL,
	"timestamp" timestamp NOT NULL,
	"timestamp_tz" timestamp with time zone NOT NULL,
	"timestamp_mode_string" timestamp NOT NULL,
	"timestamp_mode_date" timestamp NOT NULL,
	"date" date NOT NULL,
	"json" json NOT NULL,
	"jsonb" jsonb NOT NULL,
	"typed_json" jsonb NOT NULL,
	"status" "status_type" NOT NULL,
	"text_array" text[] NOT NULL,
	"int_array" integer[] NOT NULL,
	"numeric_array" numeric(10, 2)[] NOT NULL,
	"uuid_array" uuid[] NOT NULL,
	"jsonb_array" jsonb[] NOT NULL,
	"enum_array" "status_type"[] NOT NULL,
	"matrix" integer[][] NOT NULL,
	"optional_smallint" smallint,
	"optional_integer" integer,
	"optional_bigint" bigint,
	"optional_numeric" numeric(10, 2),
	"optional_real" real,
	"optional_double_precision" double precision,
	"optional_text" text,
	"optional_boolean" boolean,
	"optional_timestamp" timestamp,
	"optional_json" jsonb,
	"optional_enum" "status_type",
	"optional_varchar" varchar,
	"optional_uuid" uuid
);
--> statement-breakpoint
CREATE TABLE "filters" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"parent_id" text
);
--> statement-breakpoint
CREATE TABLE "friendship" (
	"requestingId" text NOT NULL,
	"acceptingId" text NOT NULL,
	"accepted" boolean NOT NULL,
	CONSTRAINT "friendship_requestingId_acceptingId_pk" PRIMARY KEY("requestingId","acceptingId")
);
--> statement-breakpoint
CREATE TABLE "medium" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"senderId" text,
	"mediumId" text,
	"body" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"omitted_column" text
);
--> statement-breakpoint
CREATE TABLE "omitted_table" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"partner" boolean NOT NULL,
	"email" text NOT NULL,
	"custom_type_json" jsonb NOT NULL,
	"custom_interface_json" jsonb NOT NULL,
	"test_interface" jsonb NOT NULL,
	"test_type" jsonb NOT NULL,
	"test_exported_type" jsonb NOT NULL,
	"status" text
);
--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_requestingId_user_id_fk" FOREIGN KEY ("requestingId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_acceptingId_user_id_fk" FOREIGN KEY ("acceptingId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_senderId_user_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_mediumId_medium_id_fk" FOREIGN KEY ("mediumId") REFERENCES "public"."medium"("id") ON DELETE no action ON UPDATE no action;