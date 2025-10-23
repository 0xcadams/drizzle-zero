CREATE TYPE "public"."status_type" AS ENUM('active', 'inactive', 'pending');--> statement-breakpoint
CREATE TABLE "all_types" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
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
CREATE TABLE "analytics_dashboard" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"owner_id" text,
	"title" text NOT NULL,
	"description" text,
	"default_query" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_widget" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"dashboard_id" text NOT NULL,
	"title" text NOT NULL,
	"widget_type" text NOT NULL,
	"position" integer
);
--> statement-breakpoint
CREATE TABLE "analytics_widget_query" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"widget_id" text NOT NULL,
	"data_source" text NOT NULL,
	"query" text NOT NULL,
	"refresh_interval_seconds" integer
);
--> statement-breakpoint
CREATE TABLE "ap_invoice" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"vendor_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"invoice_date" date NOT NULL,
	"due_date" date NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"paid_amount" numeric(12, 2),
	"status" text NOT NULL,
	CONSTRAINT "ap_invoice_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "ap_invoice_line_item" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"account_code" text
);
--> statement-breakpoint
CREATE TABLE "ap_payment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"payment_date" date NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"payment_method_id" text,
	"reference_number" text
);
--> statement-breakpoint
CREATE TABLE "ap_payment_method" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"method_type" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ap_vendor" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"contact_name" text,
	"email" text,
	"phone" text,
	"address" text,
	"payment_terms" text,
	"tax_id" text
);
--> statement-breakpoint
CREATE TABLE "ar_customer" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"contact_name" text,
	"email" text,
	"phone" text,
	"billing_address" text,
	"shipping_address" text,
	"payment_terms_id" text
);
--> statement-breakpoint
CREATE TABLE "ar_invoice" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"invoice_date" date NOT NULL,
	"due_date" date NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"paid_amount" numeric(12, 2),
	"status" text NOT NULL,
	CONSTRAINT "ar_invoice_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "ar_invoice_line_item" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"tax_amount" numeric(12, 2)
);
--> statement-breakpoint
CREATE TABLE "ar_payment_received" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"payment_date" date NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"payment_method" text,
	"reference_number" text
);
--> statement-breakpoint
CREATE TABLE "ar_payment_term" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"due_days" integer NOT NULL,
	"discount_percent" numeric(5, 2),
	"discount_days" integer
);
--> statement-breakpoint
CREATE TABLE "bank_account" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"account_name" text NOT NULL,
	"account_number" text NOT NULL,
	"bank_name" text NOT NULL,
	"account_type" text NOT NULL,
	"currency" text NOT NULL,
	"balance" numeric(12, 2)
);
--> statement-breakpoint
CREATE TABLE "bank_reconciliation" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"account_id" text NOT NULL,
	"statement_date" date NOT NULL,
	"statement_balance" numeric(12, 2) NOT NULL,
	"book_balance" numeric(12, 2) NOT NULL,
	"difference" numeric(12, 2),
	"status" text NOT NULL,
	"reconciled_by" text
);
--> statement-breakpoint
CREATE TABLE "bank_reconciliation_item" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"reconciliation_id" text NOT NULL,
	"transaction_id" text,
	"amount" numeric(12, 2) NOT NULL,
	"item_type" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "bank_transaction" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"account_id" text NOT NULL,
	"transaction_date" date NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"transaction_type" text NOT NULL,
	"category" text,
	"reconciled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "benefit_enrollment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"benefit_plan_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"enrolled_at" timestamp with time zone NOT NULL,
	"coverage_level" text
);
--> statement-breakpoint
CREATE TABLE "benefit_plan" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"provider" text,
	"description" text,
	"administrator_id" text
);
--> statement-breakpoint
CREATE TABLE "billing_invoice" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"account_id" text NOT NULL,
	"contact_id" text,
	"issued_by_id" text,
	"status" text NOT NULL,
	"invoice_date" date NOT NULL,
	"due_date" date,
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" char(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_invoice_line" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"order_item_id" text,
	"description" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budget" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"department_id" text,
	"fiscal_year" integer NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" char(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budget_line" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"budget_id" text NOT NULL,
	"account_id" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_account" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"owner_id" text,
	"name" text NOT NULL,
	"industry" text,
	"status" text,
	"domicile_country" char(2),
	"reporting_currency" char(3)
);
--> statement-breakpoint
CREATE TABLE "crm_account_hierarchy" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"parent_account_id" text NOT NULL,
	"child_account_id" text NOT NULL,
	"relationship_type" text
);
--> statement-breakpoint
CREATE TABLE "crm_account_industry" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"account_id" text NOT NULL,
	"industry_name" text NOT NULL,
	"sub_industry" text
);
--> statement-breakpoint
CREATE TABLE "crm_account_territory" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"region" text,
	"manager_id" text
);
--> statement-breakpoint
CREATE TABLE "crm_activity" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"account_id" text NOT NULL,
	"contact_id" text,
	"opportunity_id" text,
	"type_id" text NOT NULL,
	"performed_by_id" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "crm_activity_type" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "crm_contact" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"account_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"country_iso" char(2),
	"state_code" char(2)
);
--> statement-breakpoint
CREATE TABLE "crm_contact_duplicates" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"contact_1_id" text NOT NULL,
	"contact_2_id" text NOT NULL,
	"similarity_score" integer,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "crm_contact_engagement" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"engagement_type" text NOT NULL,
	"engagement_score" integer,
	"last_engagement" timestamp
);
--> statement-breakpoint
CREATE TABLE "crm_contact_preference" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"preference_key" text NOT NULL,
	"preference_value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_contact_role" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"role_name" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_contact_social_profile" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"platform" text NOT NULL,
	"profile_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_lead" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"company" text,
	"title" text,
	"source_id" text,
	"owner_id" text,
	"status" text NOT NULL,
	"score" integer
);
--> statement-breakpoint
CREATE TABLE "crm_lead_activity" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"lead_id" text NOT NULL,
	"user_id" text,
	"activity_type" text NOT NULL,
	"description" text,
	"activity_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_lead_assignment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"lead_id" text NOT NULL,
	"user_id" text NOT NULL,
	"assigned_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_lead_custom_field" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"field_type" text NOT NULL,
	"options" jsonb
);
--> statement-breakpoint
CREATE TABLE "crm_lead_custom_field_value" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"lead_id" text NOT NULL,
	"field_id" text NOT NULL,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "crm_lead_score" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"lead_id" text NOT NULL,
	"score" integer NOT NULL,
	"reason" text,
	"scored_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_lead_source" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_note" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"account_id" text NOT NULL,
	"contact_id" text,
	"author_id" text,
	"body" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_opportunity" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"account_id" text NOT NULL,
	"stage_id" text NOT NULL,
	"name" text NOT NULL,
	"amount" numeric(12, 2),
	"close_date" date
);
--> statement-breakpoint
CREATE TABLE "crm_opportunity_stage_history" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"stage_id" text NOT NULL,
	"changed_by_id" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_pipeline_stage" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"sequence" integer NOT NULL,
	"probability" integer
);
--> statement-breakpoint
CREATE TABLE "crm_sales_sequence" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "crm_sales_sequence_enrollment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"sequence_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"enrolled_by" text,
	"enrolled_at" timestamp NOT NULL,
	"current_step_id" text,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_sales_sequence_event" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"enrollment_id" text NOT NULL,
	"step_id" text NOT NULL,
	"event_type" text NOT NULL,
	"event_date" timestamp NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "crm_sales_sequence_step" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"sequence_id" text NOT NULL,
	"step_order" integer NOT NULL,
	"step_type" text NOT NULL,
	"content" text,
	"delay_days" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_territory_assignment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"territory_id" text NOT NULL,
	"account_id" text NOT NULL,
	"assigned_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "department" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"manager_id" text
);
--> statement-breakpoint
CREATE TABLE "document_file" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"folder_id" text NOT NULL,
	"uploaded_by_id" text,
	"file_name" text NOT NULL,
	"mime_type" text,
	"size_bytes" integer,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_file_version" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"file_id" text NOT NULL,
	"uploaded_by_id" text,
	"version" integer NOT NULL,
	"change_log" text,
	"file_size_bytes" integer
);
--> statement-breakpoint
CREATE TABLE "document_folder" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"library_id" text NOT NULL,
	"parent_id" text,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_library" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"project_id" text,
	"name" text NOT NULL,
	"description" text,
	"visibility" text
);
--> statement-breakpoint
CREATE TABLE "document_sharing" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"file_id" text NOT NULL,
	"shared_with_user_id" text,
	"shared_with_team_id" text,
	"permission" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_document" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"file_name" text NOT NULL,
	"document_type" text,
	"uploaded_by_id" text
);
--> statement-breakpoint
CREATE TABLE "employee_profile" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"department_id" text,
	"team_id" text,
	"title" text,
	"start_date" date,
	"employment_type" text
);
--> statement-breakpoint
CREATE TABLE "employment_history" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"company" text NOT NULL,
	"title" text NOT NULL,
	"start_date" date,
	"end_date" date
);
--> statement-breakpoint
CREATE TABLE "expense_item" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"report_id" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"category" text NOT NULL,
	"incurred_at" date,
	"merchant" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "expense_report" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"department_id" text,
	"status" text NOT NULL,
	"submitted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "feature_flag" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"owner_id" text,
	"definition" jsonb NOT NULL,
	"metadata" jsonb NOT NULL,
	"snapshot" jsonb NOT NULL,
	"release_track" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "filters" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text,
	"parent_id" text
);
--> statement-breakpoint
CREATE TABLE "friendship" (
	"workspace_id" text NOT NULL,
	"requestingId" text NOT NULL,
	"acceptingId" text NOT NULL,
	"accepted" boolean NOT NULL,
	CONSTRAINT "friendship_requestingId_acceptingId_pk" PRIMARY KEY("requestingId","acceptingId")
);
--> statement-breakpoint
CREATE TABLE "hr_attendance" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"date" date NOT NULL,
	"check_in" timestamp,
	"check_out" timestamp,
	"total_hours" numeric(5, 2),
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_attendance_exception" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"attendance_id" text NOT NULL,
	"exception_type" text NOT NULL,
	"reason" text,
	"resolved_by" text,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "hr_benefit" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"benefit_type" text NOT NULL,
	"description" text,
	"provider" text,
	"cost" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "hr_bonus" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"bonus_type" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text NOT NULL,
	"bonus_date" date NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "hr_department" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"head_id" text
);
--> statement-breakpoint
CREATE TABLE "hr_employee" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text,
	"employee_number" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"hire_date" date NOT NULL,
	"department_id" text,
	"manager_id" text,
	"status" text NOT NULL,
	CONSTRAINT "hr_employee_employee_number_unique" UNIQUE("employee_number")
);
--> statement-breakpoint
CREATE TABLE "hr_employee_benefit" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"benefit_id" text NOT NULL,
	"enrollment_date" date NOT NULL,
	"end_date" date,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_employee_position" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"position_id" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"is_current" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_organization_chart" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"parent_employee_id" text,
	"level" integer NOT NULL,
	"path" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_performance_feedback" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"review_id" text NOT NULL,
	"given_by" text NOT NULL,
	"feedback_type" text NOT NULL,
	"content" text NOT NULL,
	"rating" integer
);
--> statement-breakpoint
CREATE TABLE "hr_performance_goal" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"review_id" text,
	"employee_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_date" date,
	"status" text NOT NULL,
	"progress" integer
);
--> statement-breakpoint
CREATE TABLE "hr_performance_improvement" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"review_id" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"reason" text NOT NULL,
	"objectives" text NOT NULL,
	"status" text NOT NULL,
	"outcome" text
);
--> statement-breakpoint
CREATE TABLE "hr_performance_review" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"reviewer_id" text NOT NULL,
	"cycle_id" text,
	"review_date" date NOT NULL,
	"overall_rating" integer,
	"comments" text,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_performance_review_cycle" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_position" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"title" text NOT NULL,
	"level" text,
	"department_id" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "hr_salary_history" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"effective_date" date NOT NULL,
	"salary" numeric(12, 2) NOT NULL,
	"currency" text NOT NULL,
	"change_reason" text,
	"approved_by" text
);
--> statement-breakpoint
CREATE TABLE "hr_team" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"department_id" text,
	"name" text NOT NULL,
	"description" text,
	"lead_id" text
);
--> statement-breakpoint
CREATE TABLE "hr_time_off_balance" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"policy_id" text NOT NULL,
	"year" integer NOT NULL,
	"total_days" numeric(5, 2) NOT NULL,
	"used_days" numeric(5, 2) NOT NULL,
	"remaining_days" numeric(5, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_time_off_policy" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"policy_type" text NOT NULL,
	"days_per_year" integer NOT NULL,
	"carryover_days" integer,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "hr_time_off_request" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"policy_id" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"days" numeric(5, 2) NOT NULL,
	"reason" text,
	"status" text NOT NULL,
	"approver_id" text,
	"approved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "integration_credential" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"webhook_id" text,
	"provider" text NOT NULL,
	"client_id" text,
	"client_secret" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "integration_event" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"webhook_id" text NOT NULL,
	"payload" jsonb,
	"event_type" text NOT NULL,
	"delivered_at" timestamp with time zone,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_webhook" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"project_id" text,
	"account_id" text,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"secret" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_item" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"variant_id" text NOT NULL,
	"serial_number" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "inventory_level" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"location_id" text NOT NULL,
	"variant_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"reserved" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_location" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"region" text,
	"country_iso" char(2)
);
--> statement-breakpoint
CREATE TABLE "ledger_account" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"account_type" text NOT NULL,
	"parent_account_id" text
);
--> statement-breakpoint
CREATE TABLE "ledger_entry" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"transaction_id" text NOT NULL,
	"account_id" text NOT NULL,
	"debit" numeric(12, 2),
	"credit" numeric(12, 2),
	"memo" text
);
--> statement-breakpoint
CREATE TABLE "ledger_transaction" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"reference" text,
	"transaction_date" date NOT NULL,
	"created_by_id" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "marketing_audience" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"segment_type" text,
	"definition" jsonb
);
--> statement-breakpoint
CREATE TABLE "marketing_campaign" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"owner_id" text,
	"name" text NOT NULL,
	"status" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"budget_amount" numeric(12, 2)
);
--> statement-breakpoint
CREATE TABLE "marketing_campaign_audience" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" text NOT NULL,
	"audience_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_campaign_channel" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"allocation" numeric(12, 2)
);
--> statement-breakpoint
CREATE TABLE "marketing_channel" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"channel_type" text,
	"cost_model" text
);
--> statement-breakpoint
CREATE TABLE "medium" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"senderId" text,
	"mediumId" text,
	"body" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"omitted_column" text
);
--> statement-breakpoint
CREATE TABLE "omitted_table" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_competitor" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"competitor_name" text NOT NULL,
	"strengths" text,
	"weaknesses" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "opportunity_document" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"document_name" text NOT NULL,
	"document_url" text NOT NULL,
	"uploaded_by" text
);
--> statement-breakpoint
CREATE TABLE "opportunity_line_item" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"product_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2),
	"total_price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_stakeholder" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"role" text NOT NULL,
	"influence" text
);
--> statement-breakpoint
CREATE TABLE "opportunity_timeline" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"event_type" text NOT NULL,
	"event_description" text NOT NULL,
	"user_id" text,
	"event_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"order_id" text NOT NULL,
	"variant_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_payment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"order_id" text NOT NULL,
	"payment_id" text,
	"amount" numeric(12, 2) NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"customer_id" text,
	"opportunity_id" text,
	"status" text NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"currency" char(3) NOT NULL,
	"currency_metadata" jsonb NOT NULL,
	"billing_country_iso" char(2) NOT NULL,
	"shipping_country_iso" char(2) NOT NULL,
	"cdc_checkpoint" jsonb
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"external_ref" text,
	"status" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" char(3) NOT NULL,
	"received_at" timestamp with time zone,
	"received_by_id" text
);
--> statement-breakpoint
CREATE TABLE "product" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"category_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text
);
--> statement-breakpoint
CREATE TABLE "product_catalog" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_category" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_id" text
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"product_id" text NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"mime_key" text NOT NULL,
	"mime_descriptor" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variant" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"product_id" text NOT NULL,
	"sku" text NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"currency" char(3) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"owner_id" text,
	"name" text NOT NULL,
	"description" text,
	"status" text,
	"workflow_state" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_assignment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"task_id" text NOT NULL,
	"user_id" text NOT NULL,
	"assigned_at" timestamp with time zone,
	"role" text
);
--> statement-breakpoint
CREATE TABLE "project_attachment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"task_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text
);
--> statement-breakpoint
CREATE TABLE "project_audit" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"project_id" text NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "project_backlog" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"project_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" integer NOT NULL,
	"estimated_effort" integer
);
--> statement-breakpoint
CREATE TABLE "project_billable_rate" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"project_id" text,
	"user_id" text,
	"role" text,
	"rate" numeric(10, 2) NOT NULL,
	"effective_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_burndown" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"sprint_id" text NOT NULL,
	"date" date NOT NULL,
	"remaining_points" integer NOT NULL,
	"ideal_points" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_capacity_planning" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"resource_id" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"planned_capacity" integer NOT NULL,
	"actual_capacity" integer
);
--> statement-breakpoint
CREATE TABLE "project_comment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"task_id" text NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_dependency" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"predecessor_task_id" text NOT NULL,
	"successor_task_id" text NOT NULL,
	"dependency_type" text NOT NULL,
	"lag" integer
);
--> statement-breakpoint
CREATE TABLE "project_epic" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text NOT NULL,
	"owner_id" text
);
--> statement-breakpoint
CREATE TABLE "project_gantt_data" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"task_id" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"progress" integer NOT NULL,
	"critical_path" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_milestone" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"due_date" timestamp NOT NULL,
	"completed_date" timestamp,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_note" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"project_id" text NOT NULL,
	"author_id" text,
	"note" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_phase" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"sequence" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_resource" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"skill_set" jsonb,
	"availability" integer NOT NULL,
	"cost_per_hour" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "project_resource_allocation" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"resource_id" text NOT NULL,
	"project_id" text NOT NULL,
	"allocation_percent" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "project_resource_request" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"project_id" text NOT NULL,
	"requested_by" text,
	"skills_required" jsonb,
	"quantity" integer NOT NULL,
	"priority" text,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_risk" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"project_id" text NOT NULL,
	"risk_title" text NOT NULL,
	"description" text,
	"probability" text,
	"impact" text,
	"status" text NOT NULL,
	"owner_id" text
);
--> statement-breakpoint
CREATE TABLE "project_risk_mitigation" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"risk_id" text NOT NULL,
	"strategy" text NOT NULL,
	"action" text NOT NULL,
	"responsible" text,
	"due_date" timestamp,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_sprint" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"goal" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_story" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"epic_id" text,
	"title" text NOT NULL,
	"description" text,
	"story_points" integer,
	"priority" text,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_tag" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"label" text NOT NULL,
	"color" text
);
--> statement-breakpoint
CREATE TABLE "project_task" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"project_id" text NOT NULL,
	"phase_id" text NOT NULL,
	"title" text NOT NULL,
	"status" text NOT NULL,
	"priority" text
);
--> statement-breakpoint
CREATE TABLE "project_task_tag" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"task_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_time_entry" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"task_id" text,
	"user_id" text NOT NULL,
	"hours" numeric(10, 2) NOT NULL,
	"date" date NOT NULL,
	"description" text,
	"billable" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_timesheet" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"week_starting" date NOT NULL,
	"total_hours" numeric(10, 2) NOT NULL,
	"status" text NOT NULL,
	"submitted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "project_timesheet_approval" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"timesheet_id" text NOT NULL,
	"approver_id" text NOT NULL,
	"approval_status" text NOT NULL,
	"approved_at" timestamp,
	"comments" text
);
--> statement-breakpoint
CREATE TABLE "project_utilization_report" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"resource_id" text NOT NULL,
	"report_date" date NOT NULL,
	"utilization" numeric(5, 2) NOT NULL,
	"billable_hours" numeric(10, 2),
	"non_billable_hours" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "project_velocity_tracking" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"sprint_id" text NOT NULL,
	"completed_points" integer NOT NULL,
	"committed_points" integer NOT NULL,
	"velocity" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "shipment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"order_id" text NOT NULL,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"carrier" text,
	"tracking_number" text,
	"destination_country" char(2) NOT NULL,
	"destination_state" char(2)
);
--> statement-breakpoint
CREATE TABLE "shipment_item" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"shipment_id" text NOT NULL,
	"order_item_id" text NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_ticket" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"customer_id" text,
	"assigned_team_id" text,
	"subject" text NOT NULL,
	"status" text NOT NULL,
	"priority" text,
	"source" text
);
--> statement-breakpoint
CREATE TABLE "support_ticket_assignment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"ticket_id" text NOT NULL,
	"assignee_id" text,
	"assigned_at" timestamp with time zone,
	"assignment_type" text
);
--> statement-breakpoint
CREATE TABLE "support_ticket_audit" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"ticket_id" text NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "support_ticket_message" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"ticket_id" text NOT NULL,
	"author_id" text,
	"body" text NOT NULL,
	"visibility" text
);
--> statement-breakpoint
CREATE TABLE "support_ticket_tag" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"label" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "support_ticket_tag_link" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"ticket_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_jurisdiction" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"jurisdiction_type" text NOT NULL,
	"code" text
);
--> statement-breakpoint
CREATE TABLE "tax_line_item" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"return_id" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"category" text
);
--> statement-breakpoint
CREATE TABLE "tax_rate" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"rate" numeric(5, 4) NOT NULL,
	"jurisdiction_id" text,
	"tax_type" text NOT NULL,
	"effective_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_return" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"tax_year" integer NOT NULL,
	"return_type" text NOT NULL,
	"filing_date" date,
	"due_date" date NOT NULL,
	"total_tax" numeric(12, 2),
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"department_id" text NOT NULL,
	"lead_id" text,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telemetry_rollup" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"metric" text NOT NULL,
	"windowed_stats" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_bigserial_pk" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_composite_pk_both_defaults" (
	"id1" uuid DEFAULT gen_random_uuid() NOT NULL,
	"id2" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "test_composite_pk_both_defaults_id1_id2_pk" PRIMARY KEY("id1","id2")
);
--> statement-breakpoint
CREATE TABLE "test_composite_pk_one_default" (
	"tenant_id" text NOT NULL,
	"id" serial NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "test_composite_pk_one_default_tenant_id_id_pk" PRIMARY KEY("tenant_id","id")
);
--> statement-breakpoint
CREATE TABLE "test_integer_default_pk" (
	"id" integer PRIMARY KEY DEFAULT floor(random() * 1000000) NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_serial_pk" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_text_default_pk" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_timestamp_default_pk" (
	"id" timestamp PRIMARY KEY DEFAULT now() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_uuid_pk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_uuid_sql_default_pk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entry" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"timesheet_id" text NOT NULL,
	"task_id" text,
	"hours" numeric(5, 2) NOT NULL,
	"notes" text,
	"entry_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timesheet" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"submitted_by_id" text,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"partner" boolean NOT NULL,
	"email" text NOT NULL,
	"custom_type_json" jsonb NOT NULL,
	"custom_interface_json" jsonb NOT NULL,
	"test_interface" jsonb NOT NULL,
	"test_type" jsonb NOT NULL,
	"test_exported_type" jsonb NOT NULL,
	"notification_preferences" jsonb NOT NULL,
	"country_iso" char(2) NOT NULL,
	"region_code" char(2),
	"preferred_currency" char(3) NOT NULL,
	"status" text
);
--> statement-breakpoint
CREATE TABLE "webhook_subscription" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"config" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"subscription_tier" text,
	"billing_email" text,
	"settings" jsonb,
	"owner_id" text,
	"timezone" text DEFAULT 'UTC',
	"logo_url" text,
	"currency" text DEFAULT 'USD',
	"language" text DEFAULT 'en',
	"date_format" text DEFAULT 'MM/DD/YYYY',
	"time_format" text DEFAULT 'HH:mm',
	CONSTRAINT "workspace_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "workspace_api_key" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"created_by" text,
	"last_used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "workspace_audit_log" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "workspace_invitation" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"invited_by" text,
	"expires_at" timestamp,
	"accepted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "workspace_membership" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"invited_at" timestamp,
	"joined_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "all_types" ADD CONSTRAINT "all_types_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_dashboard" ADD CONSTRAINT "analytics_dashboard_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_dashboard" ADD CONSTRAINT "analytics_dashboard_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_widget" ADD CONSTRAINT "analytics_widget_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_widget" ADD CONSTRAINT "analytics_widget_dashboard_id_analytics_dashboard_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "public"."analytics_dashboard"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_widget_query" ADD CONSTRAINT "analytics_widget_query_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_widget_query" ADD CONSTRAINT "analytics_widget_query_widget_id_analytics_widget_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."analytics_widget"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ap_invoice" ADD CONSTRAINT "ap_invoice_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ap_invoice" ADD CONSTRAINT "ap_invoice_vendor_id_ap_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."ap_vendor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ap_invoice_line_item" ADD CONSTRAINT "ap_invoice_line_item_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ap_invoice_line_item" ADD CONSTRAINT "ap_invoice_line_item_invoice_id_ap_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."ap_invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ap_payment" ADD CONSTRAINT "ap_payment_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ap_payment" ADD CONSTRAINT "ap_payment_invoice_id_ap_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."ap_invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ap_payment" ADD CONSTRAINT "ap_payment_payment_method_id_ap_payment_method_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."ap_payment_method"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ap_payment_method" ADD CONSTRAINT "ap_payment_method_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ap_vendor" ADD CONSTRAINT "ap_vendor_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_customer" ADD CONSTRAINT "ar_customer_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_customer" ADD CONSTRAINT "ar_customer_payment_terms_id_ar_payment_term_id_fk" FOREIGN KEY ("payment_terms_id") REFERENCES "public"."ar_payment_term"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_invoice" ADD CONSTRAINT "ar_invoice_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_invoice" ADD CONSTRAINT "ar_invoice_customer_id_ar_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."ar_customer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_invoice_line_item" ADD CONSTRAINT "ar_invoice_line_item_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_invoice_line_item" ADD CONSTRAINT "ar_invoice_line_item_invoice_id_ar_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."ar_invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_payment_received" ADD CONSTRAINT "ar_payment_received_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_payment_received" ADD CONSTRAINT "ar_payment_received_invoice_id_ar_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."ar_invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_payment_term" ADD CONSTRAINT "ar_payment_term_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_reconciliation" ADD CONSTRAINT "bank_reconciliation_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_reconciliation" ADD CONSTRAINT "bank_reconciliation_account_id_bank_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."bank_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_reconciliation" ADD CONSTRAINT "bank_reconciliation_reconciled_by_user_id_fk" FOREIGN KEY ("reconciled_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_reconciliation_item" ADD CONSTRAINT "bank_reconciliation_item_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_reconciliation_item" ADD CONSTRAINT "bank_reconciliation_item_reconciliation_id_bank_reconciliation_id_fk" FOREIGN KEY ("reconciliation_id") REFERENCES "public"."bank_reconciliation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_reconciliation_item" ADD CONSTRAINT "bank_reconciliation_item_transaction_id_bank_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."bank_transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_transaction" ADD CONSTRAINT "bank_transaction_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_transaction" ADD CONSTRAINT "bank_transaction_account_id_bank_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."bank_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_enrollment" ADD CONSTRAINT "benefit_enrollment_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_enrollment" ADD CONSTRAINT "benefit_enrollment_benefit_plan_id_benefit_plan_id_fk" FOREIGN KEY ("benefit_plan_id") REFERENCES "public"."benefit_plan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_enrollment" ADD CONSTRAINT "benefit_enrollment_employee_id_employee_profile_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_plan" ADD CONSTRAINT "benefit_plan_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_plan" ADD CONSTRAINT "benefit_plan_administrator_id_user_id_fk" FOREIGN KEY ("administrator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_invoice" ADD CONSTRAINT "billing_invoice_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_invoice" ADD CONSTRAINT "billing_invoice_account_id_crm_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_invoice" ADD CONSTRAINT "billing_invoice_contact_id_crm_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_invoice" ADD CONSTRAINT "billing_invoice_issued_by_id_user_id_fk" FOREIGN KEY ("issued_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_invoice_line" ADD CONSTRAINT "billing_invoice_line_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_invoice_line" ADD CONSTRAINT "billing_invoice_line_invoice_id_billing_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."billing_invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_invoice_line" ADD CONSTRAINT "billing_invoice_line_order_item_id_order_item_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget" ADD CONSTRAINT "budget_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget" ADD CONSTRAINT "budget_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_line" ADD CONSTRAINT "budget_line_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_line" ADD CONSTRAINT "budget_line_budget_id_budget_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budget"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_line" ADD CONSTRAINT "budget_line_account_id_ledger_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."ledger_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_account" ADD CONSTRAINT "crm_account_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_account" ADD CONSTRAINT "crm_account_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_account_hierarchy" ADD CONSTRAINT "crm_account_hierarchy_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_account_hierarchy" ADD CONSTRAINT "crm_account_hierarchy_parent_account_id_crm_account_id_fk" FOREIGN KEY ("parent_account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_account_hierarchy" ADD CONSTRAINT "crm_account_hierarchy_child_account_id_crm_account_id_fk" FOREIGN KEY ("child_account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_account_industry" ADD CONSTRAINT "crm_account_industry_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_account_industry" ADD CONSTRAINT "crm_account_industry_account_id_crm_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_account_territory" ADD CONSTRAINT "crm_account_territory_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_account_territory" ADD CONSTRAINT "crm_account_territory_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activity" ADD CONSTRAINT "crm_activity_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activity" ADD CONSTRAINT "crm_activity_account_id_crm_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activity" ADD CONSTRAINT "crm_activity_contact_id_crm_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activity" ADD CONSTRAINT "crm_activity_opportunity_id_crm_opportunity_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."crm_opportunity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activity" ADD CONSTRAINT "crm_activity_type_id_crm_activity_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."crm_activity_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activity" ADD CONSTRAINT "crm_activity_performed_by_id_user_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activity_type" ADD CONSTRAINT "crm_activity_type_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contact" ADD CONSTRAINT "crm_contact_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contact" ADD CONSTRAINT "crm_contact_account_id_crm_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contact_duplicates" ADD CONSTRAINT "crm_contact_duplicates_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contact_duplicates" ADD CONSTRAINT "crm_contact_duplicates_contact_1_id_crm_contact_id_fk" FOREIGN KEY ("contact_1_id") REFERENCES "public"."crm_contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contact_duplicates" ADD CONSTRAINT "crm_contact_duplicates_contact_2_id_crm_contact_id_fk" FOREIGN KEY ("contact_2_id") REFERENCES "public"."crm_contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contact_engagement" ADD CONSTRAINT "crm_contact_engagement_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contact_engagement" ADD CONSTRAINT "crm_contact_engagement_contact_id_crm_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contact_preference" ADD CONSTRAINT "crm_contact_preference_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contact_preference" ADD CONSTRAINT "crm_contact_preference_contact_id_crm_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contact_role" ADD CONSTRAINT "crm_contact_role_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contact_role" ADD CONSTRAINT "crm_contact_role_contact_id_crm_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contact_social_profile" ADD CONSTRAINT "crm_contact_social_profile_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contact_social_profile" ADD CONSTRAINT "crm_contact_social_profile_contact_id_crm_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead" ADD CONSTRAINT "crm_lead_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead" ADD CONSTRAINT "crm_lead_source_id_crm_lead_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."crm_lead_source"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead" ADD CONSTRAINT "crm_lead_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead_activity" ADD CONSTRAINT "crm_lead_activity_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead_activity" ADD CONSTRAINT "crm_lead_activity_lead_id_crm_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."crm_lead"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead_activity" ADD CONSTRAINT "crm_lead_activity_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead_assignment" ADD CONSTRAINT "crm_lead_assignment_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead_assignment" ADD CONSTRAINT "crm_lead_assignment_lead_id_crm_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."crm_lead"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead_assignment" ADD CONSTRAINT "crm_lead_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead_custom_field" ADD CONSTRAINT "crm_lead_custom_field_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead_custom_field_value" ADD CONSTRAINT "crm_lead_custom_field_value_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead_custom_field_value" ADD CONSTRAINT "crm_lead_custom_field_value_lead_id_crm_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."crm_lead"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead_custom_field_value" ADD CONSTRAINT "crm_lead_custom_field_value_field_id_crm_lead_custom_field_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."crm_lead_custom_field"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead_score" ADD CONSTRAINT "crm_lead_score_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead_score" ADD CONSTRAINT "crm_lead_score_lead_id_crm_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."crm_lead"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_lead_source" ADD CONSTRAINT "crm_lead_source_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_note" ADD CONSTRAINT "crm_note_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_note" ADD CONSTRAINT "crm_note_account_id_crm_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_note" ADD CONSTRAINT "crm_note_contact_id_crm_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_note" ADD CONSTRAINT "crm_note_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity" ADD CONSTRAINT "crm_opportunity_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity" ADD CONSTRAINT "crm_opportunity_account_id_crm_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity" ADD CONSTRAINT "crm_opportunity_stage_id_crm_pipeline_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."crm_pipeline_stage"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_stage_history" ADD CONSTRAINT "crm_opportunity_stage_history_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_stage_history" ADD CONSTRAINT "crm_opportunity_stage_history_opportunity_id_crm_opportunity_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."crm_opportunity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_stage_history" ADD CONSTRAINT "crm_opportunity_stage_history_stage_id_crm_pipeline_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."crm_pipeline_stage"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_stage_history" ADD CONSTRAINT "crm_opportunity_stage_history_changed_by_id_user_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_pipeline_stage" ADD CONSTRAINT "crm_pipeline_stage_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_sales_sequence" ADD CONSTRAINT "crm_sales_sequence_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_sales_sequence" ADD CONSTRAINT "crm_sales_sequence_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_sales_sequence_enrollment" ADD CONSTRAINT "crm_sales_sequence_enrollment_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_sales_sequence_enrollment" ADD CONSTRAINT "crm_sales_sequence_enrollment_sequence_id_crm_sales_sequence_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."crm_sales_sequence"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_sales_sequence_enrollment" ADD CONSTRAINT "crm_sales_sequence_enrollment_contact_id_crm_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_sales_sequence_enrollment" ADD CONSTRAINT "crm_sales_sequence_enrollment_enrolled_by_user_id_fk" FOREIGN KEY ("enrolled_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_sales_sequence_enrollment" ADD CONSTRAINT "crm_sales_sequence_enrollment_current_step_id_crm_sales_sequence_step_id_fk" FOREIGN KEY ("current_step_id") REFERENCES "public"."crm_sales_sequence_step"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_sales_sequence_event" ADD CONSTRAINT "crm_sales_sequence_event_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_sales_sequence_event" ADD CONSTRAINT "crm_sales_sequence_event_enrollment_id_crm_sales_sequence_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."crm_sales_sequence_enrollment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_sales_sequence_event" ADD CONSTRAINT "crm_sales_sequence_event_step_id_crm_sales_sequence_step_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."crm_sales_sequence_step"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_sales_sequence_step" ADD CONSTRAINT "crm_sales_sequence_step_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_sales_sequence_step" ADD CONSTRAINT "crm_sales_sequence_step_sequence_id_crm_sales_sequence_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."crm_sales_sequence"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_territory_assignment" ADD CONSTRAINT "crm_territory_assignment_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_territory_assignment" ADD CONSTRAINT "crm_territory_assignment_territory_id_crm_account_territory_id_fk" FOREIGN KEY ("territory_id") REFERENCES "public"."crm_account_territory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_territory_assignment" ADD CONSTRAINT "crm_territory_assignment_account_id_crm_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_file" ADD CONSTRAINT "document_file_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_file" ADD CONSTRAINT "document_file_folder_id_document_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."document_folder"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_file" ADD CONSTRAINT "document_file_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_file_version" ADD CONSTRAINT "document_file_version_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_file_version" ADD CONSTRAINT "document_file_version_file_id_document_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."document_file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_file_version" ADD CONSTRAINT "document_file_version_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_folder" ADD CONSTRAINT "document_folder_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_folder" ADD CONSTRAINT "document_folder_library_id_document_library_id_fk" FOREIGN KEY ("library_id") REFERENCES "public"."document_library"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_folder" ADD CONSTRAINT "document_folder_parent_id_document_folder_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."document_folder"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_library" ADD CONSTRAINT "document_library_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_library" ADD CONSTRAINT "document_library_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_sharing" ADD CONSTRAINT "document_sharing_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_sharing" ADD CONSTRAINT "document_sharing_file_id_document_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."document_file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_sharing" ADD CONSTRAINT "document_sharing_shared_with_user_id_user_id_fk" FOREIGN KEY ("shared_with_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_sharing" ADD CONSTRAINT "document_sharing_shared_with_team_id_team_id_fk" FOREIGN KEY ("shared_with_team_id") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_document" ADD CONSTRAINT "employee_document_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_document" ADD CONSTRAINT "employee_document_employee_id_employee_profile_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_document" ADD CONSTRAINT "employee_document_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_profile" ADD CONSTRAINT "employee_profile_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_profile" ADD CONSTRAINT "employee_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_profile" ADD CONSTRAINT "employee_profile_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_profile" ADD CONSTRAINT "employee_profile_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employment_history" ADD CONSTRAINT "employment_history_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employment_history" ADD CONSTRAINT "employment_history_employee_id_employee_profile_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_item" ADD CONSTRAINT "expense_item_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_item" ADD CONSTRAINT "expense_item_report_id_expense_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."expense_report"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_report" ADD CONSTRAINT "expense_report_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_report" ADD CONSTRAINT "expense_report_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_report" ADD CONSTRAINT "expense_report_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flag" ADD CONSTRAINT "feature_flag_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "filters" ADD CONSTRAINT "filters_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_requestingId_user_id_fk" FOREIGN KEY ("requestingId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_acceptingId_user_id_fk" FOREIGN KEY ("acceptingId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_attendance" ADD CONSTRAINT "hr_attendance_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_attendance" ADD CONSTRAINT "hr_attendance_employee_id_hr_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_attendance_exception" ADD CONSTRAINT "hr_attendance_exception_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_attendance_exception" ADD CONSTRAINT "hr_attendance_exception_attendance_id_hr_attendance_id_fk" FOREIGN KEY ("attendance_id") REFERENCES "public"."hr_attendance"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_attendance_exception" ADD CONSTRAINT "hr_attendance_exception_resolved_by_hr_employee_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit" ADD CONSTRAINT "hr_benefit_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus" ADD CONSTRAINT "hr_bonus_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus" ADD CONSTRAINT "hr_bonus_employee_id_hr_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_department" ADD CONSTRAINT "hr_department_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_department" ADD CONSTRAINT "hr_department_head_id_hr_employee_id_fk" FOREIGN KEY ("head_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee" ADD CONSTRAINT "hr_employee_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee" ADD CONSTRAINT "hr_employee_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee" ADD CONSTRAINT "hr_employee_department_id_hr_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee" ADD CONSTRAINT "hr_employee_manager_id_hr_employee_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_benefit" ADD CONSTRAINT "hr_employee_benefit_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_benefit" ADD CONSTRAINT "hr_employee_benefit_employee_id_hr_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_benefit" ADD CONSTRAINT "hr_employee_benefit_benefit_id_hr_benefit_id_fk" FOREIGN KEY ("benefit_id") REFERENCES "public"."hr_benefit"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_position" ADD CONSTRAINT "hr_employee_position_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_position" ADD CONSTRAINT "hr_employee_position_employee_id_hr_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_position" ADD CONSTRAINT "hr_employee_position_position_id_hr_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."hr_position"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_organization_chart" ADD CONSTRAINT "hr_organization_chart_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_organization_chart" ADD CONSTRAINT "hr_organization_chart_employee_id_hr_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_organization_chart" ADD CONSTRAINT "hr_organization_chart_parent_employee_id_hr_employee_id_fk" FOREIGN KEY ("parent_employee_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_feedback" ADD CONSTRAINT "hr_performance_feedback_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_feedback" ADD CONSTRAINT "hr_performance_feedback_review_id_hr_performance_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."hr_performance_review"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_feedback" ADD CONSTRAINT "hr_performance_feedback_given_by_hr_employee_id_fk" FOREIGN KEY ("given_by") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_goal" ADD CONSTRAINT "hr_performance_goal_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_goal" ADD CONSTRAINT "hr_performance_goal_review_id_hr_performance_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."hr_performance_review"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_goal" ADD CONSTRAINT "hr_performance_goal_employee_id_hr_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_improvement" ADD CONSTRAINT "hr_performance_improvement_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_improvement" ADD CONSTRAINT "hr_performance_improvement_employee_id_hr_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_improvement" ADD CONSTRAINT "hr_performance_improvement_review_id_hr_performance_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."hr_performance_review"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_review" ADD CONSTRAINT "hr_performance_review_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_review" ADD CONSTRAINT "hr_performance_review_employee_id_hr_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_review" ADD CONSTRAINT "hr_performance_review_reviewer_id_hr_employee_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_review" ADD CONSTRAINT "hr_performance_review_cycle_id_hr_performance_review_cycle_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_performance_review_cycle"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_review_cycle" ADD CONSTRAINT "hr_performance_review_cycle_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_position" ADD CONSTRAINT "hr_position_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_position" ADD CONSTRAINT "hr_position_department_id_hr_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_salary_history" ADD CONSTRAINT "hr_salary_history_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_salary_history" ADD CONSTRAINT "hr_salary_history_employee_id_hr_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_salary_history" ADD CONSTRAINT "hr_salary_history_approved_by_hr_employee_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_team" ADD CONSTRAINT "hr_team_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_team" ADD CONSTRAINT "hr_team_department_id_hr_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_team" ADD CONSTRAINT "hr_team_lead_id_hr_employee_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_off_balance" ADD CONSTRAINT "hr_time_off_balance_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_off_balance" ADD CONSTRAINT "hr_time_off_balance_employee_id_hr_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_off_balance" ADD CONSTRAINT "hr_time_off_balance_policy_id_hr_time_off_policy_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."hr_time_off_policy"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_off_policy" ADD CONSTRAINT "hr_time_off_policy_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_off_request" ADD CONSTRAINT "hr_time_off_request_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_off_request" ADD CONSTRAINT "hr_time_off_request_employee_id_hr_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_off_request" ADD CONSTRAINT "hr_time_off_request_policy_id_hr_time_off_policy_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."hr_time_off_policy"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_off_request" ADD CONSTRAINT "hr_time_off_request_approver_id_hr_employee_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."hr_employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_credential" ADD CONSTRAINT "integration_credential_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_credential" ADD CONSTRAINT "integration_credential_webhook_id_integration_webhook_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."integration_webhook"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_event" ADD CONSTRAINT "integration_event_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_event" ADD CONSTRAINT "integration_event_webhook_id_integration_webhook_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."integration_webhook"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_webhook" ADD CONSTRAINT "integration_webhook_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_webhook" ADD CONSTRAINT "integration_webhook_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_webhook" ADD CONSTRAINT "integration_webhook_account_id_crm_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_item" ADD CONSTRAINT "inventory_item_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_item" ADD CONSTRAINT "inventory_item_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_level" ADD CONSTRAINT "inventory_level_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_level" ADD CONSTRAINT "inventory_level_location_id_inventory_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."inventory_location"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_level" ADD CONSTRAINT "inventory_level_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_location" ADD CONSTRAINT "inventory_location_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_account" ADD CONSTRAINT "ledger_account_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_account" ADD CONSTRAINT "ledger_account_parent_account_id_ledger_account_id_fk" FOREIGN KEY ("parent_account_id") REFERENCES "public"."ledger_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entry" ADD CONSTRAINT "ledger_entry_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entry" ADD CONSTRAINT "ledger_entry_transaction_id_ledger_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."ledger_transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entry" ADD CONSTRAINT "ledger_entry_account_id_ledger_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."ledger_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_transaction" ADD CONSTRAINT "ledger_transaction_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_transaction" ADD CONSTRAINT "ledger_transaction_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_audience" ADD CONSTRAINT "marketing_audience_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaign" ADD CONSTRAINT "marketing_campaign_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaign" ADD CONSTRAINT "marketing_campaign_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaign_audience" ADD CONSTRAINT "marketing_campaign_audience_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaign_audience" ADD CONSTRAINT "marketing_campaign_audience_campaign_id_marketing_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_campaign"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaign_audience" ADD CONSTRAINT "marketing_campaign_audience_audience_id_marketing_audience_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."marketing_audience"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaign_channel" ADD CONSTRAINT "marketing_campaign_channel_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaign_channel" ADD CONSTRAINT "marketing_campaign_channel_campaign_id_marketing_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_campaign"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaign_channel" ADD CONSTRAINT "marketing_campaign_channel_channel_id_marketing_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."marketing_channel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_channel" ADD CONSTRAINT "marketing_channel_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medium" ADD CONSTRAINT "medium_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_senderId_user_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_mediumId_medium_id_fk" FOREIGN KEY ("mediumId") REFERENCES "public"."medium"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "omitted_table" ADD CONSTRAINT "omitted_table_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_competitor" ADD CONSTRAINT "opportunity_competitor_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_competitor" ADD CONSTRAINT "opportunity_competitor_opportunity_id_crm_opportunity_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."crm_opportunity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_document" ADD CONSTRAINT "opportunity_document_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_document" ADD CONSTRAINT "opportunity_document_opportunity_id_crm_opportunity_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."crm_opportunity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_document" ADD CONSTRAINT "opportunity_document_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_line_item" ADD CONSTRAINT "opportunity_line_item_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_line_item" ADD CONSTRAINT "opportunity_line_item_opportunity_id_crm_opportunity_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."crm_opportunity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_stakeholder" ADD CONSTRAINT "opportunity_stakeholder_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_stakeholder" ADD CONSTRAINT "opportunity_stakeholder_opportunity_id_crm_opportunity_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."crm_opportunity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_stakeholder" ADD CONSTRAINT "opportunity_stakeholder_contact_id_crm_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_timeline" ADD CONSTRAINT "opportunity_timeline_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_timeline" ADD CONSTRAINT "opportunity_timeline_opportunity_id_crm_opportunity_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."crm_opportunity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_timeline" ADD CONSTRAINT "opportunity_timeline_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_payment" ADD CONSTRAINT "order_payment_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_payment" ADD CONSTRAINT "order_payment_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_payment" ADD CONSTRAINT "order_payment_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_opportunity_id_crm_opportunity_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."crm_opportunity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_received_by_id_user_id_fk" FOREIGN KEY ("received_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_product_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_catalog" ADD CONSTRAINT "product_catalog_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_parent_id_product_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assignment" ADD CONSTRAINT "project_assignment_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assignment" ADD CONSTRAINT "project_assignment_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assignment" ADD CONSTRAINT "project_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_attachment" ADD CONSTRAINT "project_attachment_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_attachment" ADD CONSTRAINT "project_attachment_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_audit" ADD CONSTRAINT "project_audit_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_audit" ADD CONSTRAINT "project_audit_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_audit" ADD CONSTRAINT "project_audit_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_backlog" ADD CONSTRAINT "project_backlog_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_backlog" ADD CONSTRAINT "project_backlog_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_billable_rate" ADD CONSTRAINT "project_billable_rate_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_billable_rate" ADD CONSTRAINT "project_billable_rate_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_billable_rate" ADD CONSTRAINT "project_billable_rate_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_burndown" ADD CONSTRAINT "project_burndown_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_burndown" ADD CONSTRAINT "project_burndown_sprint_id_project_sprint_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."project_sprint"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_capacity_planning" ADD CONSTRAINT "project_capacity_planning_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_capacity_planning" ADD CONSTRAINT "project_capacity_planning_resource_id_project_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."project_resource"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_comment" ADD CONSTRAINT "project_comment_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_comment" ADD CONSTRAINT "project_comment_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_comment" ADD CONSTRAINT "project_comment_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_dependency" ADD CONSTRAINT "project_dependency_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_dependency" ADD CONSTRAINT "project_dependency_predecessor_task_id_project_task_id_fk" FOREIGN KEY ("predecessor_task_id") REFERENCES "public"."project_task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_dependency" ADD CONSTRAINT "project_dependency_successor_task_id_project_task_id_fk" FOREIGN KEY ("successor_task_id") REFERENCES "public"."project_task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_epic" ADD CONSTRAINT "project_epic_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_epic" ADD CONSTRAINT "project_epic_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_epic" ADD CONSTRAINT "project_epic_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_gantt_data" ADD CONSTRAINT "project_gantt_data_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_gantt_data" ADD CONSTRAINT "project_gantt_data_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestone" ADD CONSTRAINT "project_milestone_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestone" ADD CONSTRAINT "project_milestone_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_note" ADD CONSTRAINT "project_note_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_note" ADD CONSTRAINT "project_note_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_note" ADD CONSTRAINT "project_note_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_phase" ADD CONSTRAINT "project_phase_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_phase" ADD CONSTRAINT "project_phase_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_resource" ADD CONSTRAINT "project_resource_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_resource" ADD CONSTRAINT "project_resource_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_resource_allocation" ADD CONSTRAINT "project_resource_allocation_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_resource_allocation" ADD CONSTRAINT "project_resource_allocation_resource_id_project_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."project_resource"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_resource_allocation" ADD CONSTRAINT "project_resource_allocation_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_resource_request" ADD CONSTRAINT "project_resource_request_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_resource_request" ADD CONSTRAINT "project_resource_request_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_resource_request" ADD CONSTRAINT "project_resource_request_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_risk" ADD CONSTRAINT "project_risk_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_risk" ADD CONSTRAINT "project_risk_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_risk" ADD CONSTRAINT "project_risk_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_risk_mitigation" ADD CONSTRAINT "project_risk_mitigation_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_risk_mitigation" ADD CONSTRAINT "project_risk_mitigation_risk_id_project_risk_id_fk" FOREIGN KEY ("risk_id") REFERENCES "public"."project_risk"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_risk_mitigation" ADD CONSTRAINT "project_risk_mitigation_responsible_user_id_fk" FOREIGN KEY ("responsible") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_sprint" ADD CONSTRAINT "project_sprint_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_sprint" ADD CONSTRAINT "project_sprint_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_story" ADD CONSTRAINT "project_story_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_story" ADD CONSTRAINT "project_story_epic_id_project_epic_id_fk" FOREIGN KEY ("epic_id") REFERENCES "public"."project_epic"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tag" ADD CONSTRAINT "project_tag_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task" ADD CONSTRAINT "project_task_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task" ADD CONSTRAINT "project_task_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task" ADD CONSTRAINT "project_task_phase_id_project_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phase"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task_tag" ADD CONSTRAINT "project_task_tag_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task_tag" ADD CONSTRAINT "project_task_tag_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task_tag" ADD CONSTRAINT "project_task_tag_tag_id_project_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."project_tag"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_time_entry" ADD CONSTRAINT "project_time_entry_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_time_entry" ADD CONSTRAINT "project_time_entry_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_time_entry" ADD CONSTRAINT "project_time_entry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_timesheet" ADD CONSTRAINT "project_timesheet_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_timesheet" ADD CONSTRAINT "project_timesheet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_timesheet_approval" ADD CONSTRAINT "project_timesheet_approval_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_timesheet_approval" ADD CONSTRAINT "project_timesheet_approval_timesheet_id_project_timesheet_id_fk" FOREIGN KEY ("timesheet_id") REFERENCES "public"."project_timesheet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_timesheet_approval" ADD CONSTRAINT "project_timesheet_approval_approver_id_user_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_utilization_report" ADD CONSTRAINT "project_utilization_report_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_utilization_report" ADD CONSTRAINT "project_utilization_report_resource_id_project_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."project_resource"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_velocity_tracking" ADD CONSTRAINT "project_velocity_tracking_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_velocity_tracking" ADD CONSTRAINT "project_velocity_tracking_sprint_id_project_sprint_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."project_sprint"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_item" ADD CONSTRAINT "shipment_item_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_item" ADD CONSTRAINT "shipment_item_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_item" ADD CONSTRAINT "shipment_item_order_item_id_order_item_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket" ADD CONSTRAINT "support_ticket_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket" ADD CONSTRAINT "support_ticket_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket" ADD CONSTRAINT "support_ticket_assigned_team_id_team_id_fk" FOREIGN KEY ("assigned_team_id") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_assignment" ADD CONSTRAINT "support_ticket_assignment_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_assignment" ADD CONSTRAINT "support_ticket_assignment_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_ticket"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_assignment" ADD CONSTRAINT "support_ticket_assignment_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_audit" ADD CONSTRAINT "support_ticket_audit_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_audit" ADD CONSTRAINT "support_ticket_audit_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_ticket"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_audit" ADD CONSTRAINT "support_ticket_audit_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_message" ADD CONSTRAINT "support_ticket_message_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_message" ADD CONSTRAINT "support_ticket_message_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_ticket"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_message" ADD CONSTRAINT "support_ticket_message_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_tag" ADD CONSTRAINT "support_ticket_tag_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_tag_link" ADD CONSTRAINT "support_ticket_tag_link_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_tag_link" ADD CONSTRAINT "support_ticket_tag_link_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_ticket"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_tag_link" ADD CONSTRAINT "support_ticket_tag_link_tag_id_support_ticket_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."support_ticket_tag"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_jurisdiction" ADD CONSTRAINT "tax_jurisdiction_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_line_item" ADD CONSTRAINT "tax_line_item_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_line_item" ADD CONSTRAINT "tax_line_item_return_id_tax_return_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."tax_return"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_rate" ADD CONSTRAINT "tax_rate_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_rate" ADD CONSTRAINT "tax_rate_jurisdiction_id_tax_jurisdiction_id_fk" FOREIGN KEY ("jurisdiction_id") REFERENCES "public"."tax_jurisdiction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_return" ADD CONSTRAINT "tax_return_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_lead_id_user_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telemetry_rollup" ADD CONSTRAINT "telemetry_rollup_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_timesheet_id_timesheet_id_fk" FOREIGN KEY ("timesheet_id") REFERENCES "public"."timesheet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_employee_id_employee_profile_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_submitted_by_id_user_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_subscription" ADD CONSTRAINT "webhook_subscription_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_api_key" ADD CONSTRAINT "workspace_api_key_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_api_key" ADD CONSTRAINT "workspace_api_key_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_audit_log" ADD CONSTRAINT "workspace_audit_log_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_audit_log" ADD CONSTRAINT "workspace_audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invitation" ADD CONSTRAINT "workspace_invitation_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invitation" ADD CONSTRAINT "workspace_invitation_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_membership" ADD CONSTRAINT "workspace_membership_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_membership" ADD CONSTRAINT "workspace_membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;