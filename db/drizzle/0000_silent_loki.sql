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
	"owner_id" text,
	"title" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "analytics_widget" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"widget_id" text NOT NULL,
	"data_source" text NOT NULL,
	"query" text NOT NULL,
	"refresh_interval_seconds" integer
);
--> statement-breakpoint
CREATE TABLE "benefit_enrollment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"budget_id" text NOT NULL,
	"account_id" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_account" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text,
	"name" text NOT NULL,
	"industry" text,
	"status" text
);
--> statement-breakpoint
CREATE TABLE "crm_activity" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "crm_contact" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text
);
--> statement-breakpoint
CREATE TABLE "crm_note" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"name" text NOT NULL,
	"sequence" integer NOT NULL,
	"probability" integer
);
--> statement-breakpoint
CREATE TABLE "department" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"manager_id" text
);
--> statement-breakpoint
CREATE TABLE "document_file" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"library_id" text NOT NULL,
	"parent_id" text,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_library" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"owner_id" text NOT NULL,
	"department_id" text,
	"status" text NOT NULL,
	"submitted_at" timestamp with time zone
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
CREATE TABLE "integration_credential" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"variant_id" text NOT NULL,
	"serial_number" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "inventory_level" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"name" text NOT NULL,
	"address" text,
	"region" text
);
--> statement-breakpoint
CREATE TABLE "ledger_account" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"name" text NOT NULL,
	"segment_type" text,
	"definition" jsonb
);
--> statement-breakpoint
CREATE TABLE "marketing_campaign" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"campaign_id" text NOT NULL,
	"audience_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_campaign_channel" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"allocation" numeric(12, 2)
);
--> statement-breakpoint
CREATE TABLE "marketing_channel" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"channel_type" text,
	"cost_model" text
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
CREATE TABLE "order_item" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"customer_id" text,
	"opportunity_id" text,
	"status" text NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"currency" char(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"category_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text
);
--> statement-breakpoint
CREATE TABLE "product_category" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_id" text
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variant" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"owner_id" text,
	"name" text NOT NULL,
	"description" text,
	"status" text
);
--> statement-breakpoint
CREATE TABLE "project_assignment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"task_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text
);
--> statement-breakpoint
CREATE TABLE "project_audit" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "project_comment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_note" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"author_id" text,
	"note" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_phase" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"sequence" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_tag" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"color" text
);
--> statement-breakpoint
CREATE TABLE "project_task" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"task_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipment" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"carrier" text,
	"tracking_number" text
);
--> statement-breakpoint
CREATE TABLE "shipment_item" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"shipment_id" text NOT NULL,
	"order_item_id" text NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_ticket" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
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
	"label" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "support_ticket_tag_link" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team" (
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL,
	"lead_id" text,
	"name" text NOT NULL
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
ALTER TABLE "analytics_dashboard" ADD CONSTRAINT "analytics_dashboard_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_widget" ADD CONSTRAINT "analytics_widget_dashboard_id_analytics_dashboard_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "public"."analytics_dashboard"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_widget_query" ADD CONSTRAINT "analytics_widget_query_widget_id_analytics_widget_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."analytics_widget"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_enrollment" ADD CONSTRAINT "benefit_enrollment_benefit_plan_id_benefit_plan_id_fk" FOREIGN KEY ("benefit_plan_id") REFERENCES "public"."benefit_plan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_enrollment" ADD CONSTRAINT "benefit_enrollment_employee_id_employee_profile_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_plan" ADD CONSTRAINT "benefit_plan_administrator_id_user_id_fk" FOREIGN KEY ("administrator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_invoice" ADD CONSTRAINT "billing_invoice_account_id_crm_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_invoice" ADD CONSTRAINT "billing_invoice_contact_id_crm_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_invoice" ADD CONSTRAINT "billing_invoice_issued_by_id_user_id_fk" FOREIGN KEY ("issued_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_invoice_line" ADD CONSTRAINT "billing_invoice_line_invoice_id_billing_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."billing_invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_invoice_line" ADD CONSTRAINT "billing_invoice_line_order_item_id_order_item_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget" ADD CONSTRAINT "budget_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_line" ADD CONSTRAINT "budget_line_budget_id_budget_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budget"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_line" ADD CONSTRAINT "budget_line_account_id_ledger_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."ledger_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_account" ADD CONSTRAINT "crm_account_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activity" ADD CONSTRAINT "crm_activity_account_id_crm_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activity" ADD CONSTRAINT "crm_activity_contact_id_crm_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activity" ADD CONSTRAINT "crm_activity_opportunity_id_crm_opportunity_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."crm_opportunity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activity" ADD CONSTRAINT "crm_activity_type_id_crm_activity_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."crm_activity_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activity" ADD CONSTRAINT "crm_activity_performed_by_id_user_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contact" ADD CONSTRAINT "crm_contact_account_id_crm_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_note" ADD CONSTRAINT "crm_note_account_id_crm_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_note" ADD CONSTRAINT "crm_note_contact_id_crm_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_note" ADD CONSTRAINT "crm_note_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity" ADD CONSTRAINT "crm_opportunity_account_id_crm_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity" ADD CONSTRAINT "crm_opportunity_stage_id_crm_pipeline_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."crm_pipeline_stage"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_stage_history" ADD CONSTRAINT "crm_opportunity_stage_history_opportunity_id_crm_opportunity_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."crm_opportunity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_stage_history" ADD CONSTRAINT "crm_opportunity_stage_history_stage_id_crm_pipeline_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."crm_pipeline_stage"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_stage_history" ADD CONSTRAINT "crm_opportunity_stage_history_changed_by_id_user_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_file" ADD CONSTRAINT "document_file_folder_id_document_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."document_folder"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_file" ADD CONSTRAINT "document_file_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_file_version" ADD CONSTRAINT "document_file_version_file_id_document_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."document_file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_file_version" ADD CONSTRAINT "document_file_version_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_folder" ADD CONSTRAINT "document_folder_library_id_document_library_id_fk" FOREIGN KEY ("library_id") REFERENCES "public"."document_library"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_folder" ADD CONSTRAINT "document_folder_parent_id_document_folder_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."document_folder"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_library" ADD CONSTRAINT "document_library_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_sharing" ADD CONSTRAINT "document_sharing_file_id_document_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."document_file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_sharing" ADD CONSTRAINT "document_sharing_shared_with_user_id_user_id_fk" FOREIGN KEY ("shared_with_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_sharing" ADD CONSTRAINT "document_sharing_shared_with_team_id_team_id_fk" FOREIGN KEY ("shared_with_team_id") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_document" ADD CONSTRAINT "employee_document_employee_id_employee_profile_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_document" ADD CONSTRAINT "employee_document_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_profile" ADD CONSTRAINT "employee_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_profile" ADD CONSTRAINT "employee_profile_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_profile" ADD CONSTRAINT "employee_profile_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employment_history" ADD CONSTRAINT "employment_history_employee_id_employee_profile_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_item" ADD CONSTRAINT "expense_item_report_id_expense_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."expense_report"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_report" ADD CONSTRAINT "expense_report_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_report" ADD CONSTRAINT "expense_report_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_requestingId_user_id_fk" FOREIGN KEY ("requestingId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_acceptingId_user_id_fk" FOREIGN KEY ("acceptingId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_credential" ADD CONSTRAINT "integration_credential_webhook_id_integration_webhook_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."integration_webhook"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_event" ADD CONSTRAINT "integration_event_webhook_id_integration_webhook_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."integration_webhook"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_webhook" ADD CONSTRAINT "integration_webhook_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_webhook" ADD CONSTRAINT "integration_webhook_account_id_crm_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."crm_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_item" ADD CONSTRAINT "inventory_item_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_level" ADD CONSTRAINT "inventory_level_location_id_inventory_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."inventory_location"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_level" ADD CONSTRAINT "inventory_level_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_account" ADD CONSTRAINT "ledger_account_parent_account_id_ledger_account_id_fk" FOREIGN KEY ("parent_account_id") REFERENCES "public"."ledger_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entry" ADD CONSTRAINT "ledger_entry_transaction_id_ledger_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."ledger_transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entry" ADD CONSTRAINT "ledger_entry_account_id_ledger_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."ledger_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_transaction" ADD CONSTRAINT "ledger_transaction_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaign" ADD CONSTRAINT "marketing_campaign_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaign_audience" ADD CONSTRAINT "marketing_campaign_audience_campaign_id_marketing_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_campaign"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaign_audience" ADD CONSTRAINT "marketing_campaign_audience_audience_id_marketing_audience_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."marketing_audience"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaign_channel" ADD CONSTRAINT "marketing_campaign_channel_campaign_id_marketing_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_campaign"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaign_channel" ADD CONSTRAINT "marketing_campaign_channel_channel_id_marketing_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."marketing_channel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_senderId_user_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_mediumId_medium_id_fk" FOREIGN KEY ("mediumId") REFERENCES "public"."medium"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_payment" ADD CONSTRAINT "order_payment_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_payment" ADD CONSTRAINT "order_payment_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_opportunity_id_crm_opportunity_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."crm_opportunity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_received_by_id_user_id_fk" FOREIGN KEY ("received_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_product_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_parent_id_product_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assignment" ADD CONSTRAINT "project_assignment_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assignment" ADD CONSTRAINT "project_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_attachment" ADD CONSTRAINT "project_attachment_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_audit" ADD CONSTRAINT "project_audit_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_audit" ADD CONSTRAINT "project_audit_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_comment" ADD CONSTRAINT "project_comment_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_comment" ADD CONSTRAINT "project_comment_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_note" ADD CONSTRAINT "project_note_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_note" ADD CONSTRAINT "project_note_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_phase" ADD CONSTRAINT "project_phase_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task" ADD CONSTRAINT "project_task_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task" ADD CONSTRAINT "project_task_phase_id_project_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phase"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task_tag" ADD CONSTRAINT "project_task_tag_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_task_tag" ADD CONSTRAINT "project_task_tag_tag_id_project_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."project_tag"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_item" ADD CONSTRAINT "shipment_item_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_item" ADD CONSTRAINT "shipment_item_order_item_id_order_item_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket" ADD CONSTRAINT "support_ticket_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket" ADD CONSTRAINT "support_ticket_assigned_team_id_team_id_fk" FOREIGN KEY ("assigned_team_id") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_assignment" ADD CONSTRAINT "support_ticket_assignment_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_ticket"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_assignment" ADD CONSTRAINT "support_ticket_assignment_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_audit" ADD CONSTRAINT "support_ticket_audit_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_ticket"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_audit" ADD CONSTRAINT "support_ticket_audit_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_message" ADD CONSTRAINT "support_ticket_message_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_ticket"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_message" ADD CONSTRAINT "support_ticket_message_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_tag_link" ADD CONSTRAINT "support_ticket_tag_link_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_ticket"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_tag_link" ADD CONSTRAINT "support_ticket_tag_link_tag_id_support_ticket_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."support_ticket_tag"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_lead_id_user_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_timesheet_id_timesheet_id_fk" FOREIGN KEY ("timesheet_id") REFERENCES "public"."timesheet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_employee_id_employee_profile_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_submitted_by_id_user_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;