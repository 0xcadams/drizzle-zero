import { relations, sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  boolean,
  char,
  date,
  doublePrecision,
  integer,
  json,
  jsonb,
  foreignKey,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  serial,
  smallint,
  smallserial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type {
  CustomJsonType,
  CustomJsonInterface,
} from "@drizzle-zero/custom-types";

export interface TestInterface {
  nameInterface: "custom-inline-interface";
}

export type TestExportedType = {
  nameType: "custom-inline-type";
};

type TestType = {
  nameType: "custom-inline-type";
};

const sharedColumns = {
  createdAt: timestamp("createdAt", {
    mode: "string",
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "string",
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
} as const;

export const user = pgTable("user", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  partner: boolean("partner").notNull(),
  email: text("email").$type<`${string}@${string}`>().notNull(),
  customTypeJson: jsonb("custom_type_json").$type<CustomJsonType>().notNull(),
  customInterfaceJson: jsonb("custom_interface_json")
    .$type<CustomJsonInterface>()
    .notNull(),
  testInterface: jsonb("test_interface").$type<TestInterface>().notNull(),
  testType: jsonb("test_type").$type<TestType>().notNull(),
  testExportedType: jsonb("test_exported_type")
    .$type<TestExportedType>()
    .notNull(),
  status: text("status", { enum: ["ASSIGNED", "COMPLETED"] }),
});

export const userRelations = relations(user, ({ many }) => ({
  workspace: one(workspace, {
    fields: [user.workspaceId],
    references: [workspace.id],
  }),
  messages: many(message),
}));

export const medium = pgTable("medium", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
});

export const mediumRelations = relations(medium, ({ many }) => ({
  workspace: one(workspace, {
    fields: [medium.workspaceId],
    references: [workspace.id],
  }),
  messages: many(message),
}));

export const message = pgTable("message", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  senderId: text("senderId").references(() => user.id),
  mediumId: text("mediumId").references(() => medium.id),
  body: text("body").notNull(),
  metadata: jsonb("metadata").$type<{ key: string }>().notNull(),
  omittedColumn: text("omitted_column"),
});

export const messageRelations = relations(message, ({ one }) => ({
  workspace: one(workspace, {
    fields: [message.workspaceId],
    references: [workspace.id],
  }),
  medium: one(medium, {
    fields: [message.mediumId],
    references: [medium.id],
  }),
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
  }),
}));

export const statusEnum = pgEnum("status_type", [
  "active",
  "inactive",
  "pending",
]);

export const allTypes = pgTable("all_types", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  smallintField: smallint("smallint").notNull(),
  integerField: integer("integer").notNull(),
  bigintField: bigint("bigint", { mode: "bigint" }).notNull(),
  bigintNumberField: bigint("bigint_number", { mode: "number" }).notNull(),
  smallSerialField: smallserial("smallserial").notNull(),
  serialField: serial("serial").notNull(),
  bigSerialField: bigserial("bigserial", { mode: "number" }).notNull(),
  numericField: numeric("numeric", { precision: 10, scale: 2 }).notNull(),
  decimalField: numeric("decimal", { precision: 10, scale: 2 }).notNull(),
  realField: real("real").notNull(),
  doublePrecisionField: doublePrecision("double_precision").notNull(),
  textField: text("text").notNull(),
  charField: char("char").notNull(),
  uuidField: uuid("uuid").notNull(),
  varcharField: varchar("varchar").notNull(),
  booleanField: boolean("boolean").notNull(),
  timestampField: timestamp("timestamp").notNull(),
  timestampTzField: timestamp("timestamp_tz", { withTimezone: true }).notNull(),
  timestampModeString: timestamp("timestamp_mode_string", {
    mode: "string",
  }).notNull(),
  timestampModeDate: timestamp("timestamp_mode_date", {
    mode: "date",
  }).notNull(),
  dateField: date("date").notNull(),
  jsonField: json("json").notNull(),
  jsonbField: jsonb("jsonb").notNull(),
  typedJsonField: jsonb("typed_json")
    .$type<{ theme: string; fontSize: number }>()
    .notNull(),
  status: statusEnum("status").notNull(),
  textArray: text("text_array").array().notNull(),
  intArray: integer("int_array").array().notNull(),
  // boolArray: boolean("bool_array").array().notNull(),
  numericArray: numeric("numeric_array", {
    precision: 10,
    scale: 2,
    mode: "number",
  })
    .array()
    .notNull(),
  uuidArray: uuid("uuid_array").array().notNull(),
  jsonbArray: jsonb("jsonb_array").array().$type<{ key: string }[]>().notNull(),
  enumArray: statusEnum("enum_array").array().notNull(),
  optionalSmallint: smallint("optional_smallint"),
  optionalInteger: integer("optional_integer"),
  optionalBigint: bigint("optional_bigint", { mode: "number" }),
  optionalNumeric: numeric("optional_numeric", { precision: 10, scale: 2 }),
  optionalReal: real("optional_real"),
  optionalDoublePrecision: doublePrecision("optional_double_precision"),
  optionalText: text("optional_text"),
  optionalBoolean: boolean("optional_boolean"),
  optionalTimestamp: timestamp("optional_timestamp"),
  optionalJson: jsonb("optional_json"),
  optionalEnum: statusEnum("optional_enum"),
  optionalVarchar: varchar("optional_varchar"),
  optionalUuid: uuid("optional_uuid"),
});

// also testing snake case
export const friendship = pgTable(
  "friendship",
  {
    workspaceId: text("workspace_id").notNull().references(() => workspace.id),
    requestingId: text()
      .notNull()
      .references(() => user.id),
    acceptingId: text()
      .notNull()
      .references(() => user.id),
    accepted: boolean().notNull(),
  },
  (t) => [primaryKey({ columns: [t.requestingId, t.acceptingId] })],
);

export const friendshipRelations = relations(friendship, ({ one }) => ({
  workspace: one(workspace, {
    fields: [friendship.workspaceId],
    references: [workspace.id],
  }),
  requesting: one(user, {
    fields: [friendship.requestingId],
    references: [user.id],
  }),
  accepting: one(user, {
    fields: [friendship.acceptingId],
    references: [user.id],
  }),
}));

export const filters = pgTable("filters", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name"),
  parentId: text("parent_id"),
});

export const filtersRelations = relations(filters, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [filters.workspaceId],
    references: [workspace.id],
  }),
  parent: one(filters, {
    fields: [filters.parentId],
    references: [filters.id],
  }),
  children: many(filters),
}));

export const omittedTable = pgTable("omitted_table", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
});

export const omittedTableRelations = relations(omittedTable, ({ one }) => ({
  workspace: one(workspace, {
    fields: [omittedTable.workspaceId],
    references: [workspace.id],
  }),
}));

export const projectTag = pgTable("project_tag", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  label: text("label").notNull(),
  color: text("color"),
});

export const project = pgTable("project", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  ownerId: text("owner_id").references(() => user.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status"),
});

export const projectPhase = pgTable("project_phase", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id),
  name: text("name").notNull(),
  sequence: integer("sequence").notNull(),
});

export const projectTask = pgTable("project_task", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id),
  phaseId: text("phase_id")
    .notNull()
    .references(() => projectPhase.id),
  title: text("title").notNull(),
  status: text("status").notNull(),
  priority: text("priority"),
});

export const projectAssignment = pgTable("project_assignment", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  taskId: text("task_id")
    .notNull()
    .references(() => projectTask.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  assignedAt: timestamp("assigned_at", { withTimezone: true }),
  role: text("role"),
});

export const projectComment = pgTable("project_comment", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  taskId: text("task_id")
    .notNull()
    .references(() => projectTask.id),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  body: text("body").notNull(),
});

export const projectAttachment = pgTable("project_attachment", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  taskId: text("task_id")
    .notNull()
    .references(() => projectTask.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type"),
});

export const projectTaskTag = pgTable("project_task_tag", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  taskId: text("task_id")
    .notNull()
    .references(() => projectTask.id),
  tagId: text("tag_id")
    .notNull()
    .references(() => projectTag.id),
});

export const projectNote = pgTable("project_note", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id),
  authorId: text("author_id").references(() => user.id),
  note: text("note").notNull(),
});

export const projectAudit = pgTable("project_audit", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id),
  actorId: text("actor_id").references(() => user.id),
  action: text("action").notNull(),
  details: jsonb("details"),
});

export const projectTagRelations = relations(projectTag, ({ many }) => ({
  workspace: one(workspace, {
    fields: [projectTag.workspaceId],
    references: [workspace.id],
  }),
  taskLinks: many(projectTaskTag),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [project.workspaceId],
    references: [workspace.id],
  }),
  owner: one(user, {
    fields: [project.ownerId],
    references: [user.id],
  }),
  phases: many(projectPhase),
  tasks: many(projectTask),
  notes: many(projectNote),
  audits: many(projectAudit),
}));

export const projectPhaseRelations = relations(
  projectPhase,
  ({ one, many }) => ({
    project: one(project, {
      fields: [projectPhase.projectId],
      references: [project.id],
    }),
    tasks: many(projectTask),
  }),
);

export const projectTaskRelations = relations(projectTask, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [projectTask.workspaceId],
    references: [workspace.id],
  }),
  project: one(project, {
    fields: [projectTask.projectId],
    references: [project.id],
  }),
  phase: one(projectPhase, {
    fields: [projectTask.phaseId],
    references: [projectPhase.id],
  }),
  assignments: many(projectAssignment),
  comments: many(projectComment),
  attachments: many(projectAttachment),
  tags: many(projectTaskTag),
}));

export const projectAssignmentRelations = relations(
  projectAssignment,
  ({ one }) => ({
    task: one(projectTask, {
      fields: [projectAssignment.taskId],
      references: [projectTask.id],
    }),
    user: one(user, {
      fields: [projectAssignment.userId],
      references: [user.id],
    }),
  }),
);

export const projectCommentRelations = relations(projectComment, ({ one }) => ({
  workspace: one(workspace, {
    fields: [projectComment.workspaceId],
    references: [workspace.id],
  }),
  task: one(projectTask, {
    fields: [projectComment.taskId],
    references: [projectTask.id],
  }),
  author: one(user, {
    fields: [projectComment.authorId],
    references: [user.id],
  }),
}));

export const projectAttachmentRelations = relations(
  projectAttachment,
  ({ one }) => ({
    task: one(projectTask, {
      fields: [projectAttachment.taskId],
      references: [projectTask.id],
    }),
  }),
);

export const projectTaskTagRelations = relations(projectTaskTag, ({ one }) => ({
  workspace: one(workspace, {
    fields: [projectTaskTag.workspaceId],
    references: [workspace.id],
  }),
  task: one(projectTask, {
    fields: [projectTaskTag.taskId],
    references: [projectTask.id],
  }),
  tag: one(projectTag, {
    fields: [projectTaskTag.tagId],
    references: [projectTag.id],
  }),
}));

export const projectNoteRelations = relations(projectNote, ({ one }) => ({
  workspace: one(workspace, {
    fields: [projectNote.workspaceId],
    references: [workspace.id],
  }),
  project: one(project, {
    fields: [projectNote.projectId],
    references: [project.id],
  }),
  author: one(user, {
    fields: [projectNote.authorId],
    references: [user.id],
  }),
}));

export const projectAuditRelations = relations(projectAudit, ({ one }) => ({
  workspace: one(workspace, {
    fields: [projectAudit.workspaceId],
    references: [workspace.id],
  }),
  project: one(project, {
    fields: [projectAudit.projectId],
    references: [project.id],
  }),
  actor: one(user, {
    fields: [projectAudit.actorId],
    references: [user.id],
  }),
}));

export const crmAccount = pgTable("crm_account", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  ownerId: text("owner_id").references(() => user.id),
  name: text("name").notNull(),
  industry: text("industry"),
  status: text("status"),
});

export const crmContact = pgTable("crm_contact", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  accountId: text("account_id")
    .notNull()
    .references(() => crmAccount.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
});

export const crmPipelineStage = pgTable("crm_pipeline_stage", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  sequence: integer("sequence").notNull(),
  probability: integer("probability"),
});

export const crmOpportunity = pgTable("crm_opportunity", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  accountId: text("account_id")
    .notNull()
    .references(() => crmAccount.id),
  stageId: text("stage_id")
    .notNull()
    .references(() => crmPipelineStage.id),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  closeDate: date("close_date"),
});

export const crmOpportunityStageHistory = pgTable(
  "crm_opportunity_stage_history",
  {
    ...sharedColumns,
    id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
    opportunityId: text("opportunity_id")
      .notNull()
      .references(() => crmOpportunity.id),
    stageId: text("stage_id")
      .notNull()
      .references(() => crmPipelineStage.id),
    changedById: text("changed_by_id").references(() => user.id),
    changedAt: timestamp("changed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
);

export const crmActivityType = pgTable("crm_activity_type", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  description: text("description"),
});

export const crmActivity = pgTable("crm_activity", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  accountId: text("account_id")
    .notNull()
    .references(() => crmAccount.id),
  contactId: text("contact_id").references(() => crmContact.id),
  opportunityId: text("opportunity_id").references(() => crmOpportunity.id),
  typeId: text("type_id")
    .notNull()
    .references(() => crmActivityType.id),
  performedById: text("performed_by_id").references(() => user.id),
  notes: text("notes"),
});

export const crmNote = pgTable("crm_note", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  accountId: text("account_id")
    .notNull()
    .references(() => crmAccount.id),
  contactId: text("contact_id").references(() => crmContact.id),
  authorId: text("author_id").references(() => user.id),
  body: text("body").notNull(),
});

export const crmAccountRelations = relations(crmAccount, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [crmAccount.workspaceId],
    references: [workspace.id],
  }),
  owner: one(user, {
    fields: [crmAccount.ownerId],
    references: [user.id],
  }),
  contacts: many(crmContact),
  opportunities: many(crmOpportunity),
  activities: many(crmActivity),
  notes: many(crmNote),
}));

export const crmContactRelations = relations(crmContact, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [crmContact.workspaceId],
    references: [workspace.id],
  }),
  account: one(crmAccount, {
    fields: [crmContact.accountId],
    references: [crmAccount.id],
  }),
  activities: many(crmActivity),
  notes: many(crmNote),
}));

export const crmPipelineStageRelations = relations(
  crmPipelineStage,
  ({ many }) => ({
    opportunities: many(crmOpportunity),
    historyEntries: many(crmOpportunityStageHistory),
  }),
);

export const crmOpportunityRelations = relations(
  crmOpportunity,
  ({ one, many }) => ({
    account: one(crmAccount, {
      fields: [crmOpportunity.accountId],
      references: [crmAccount.id],
    }),
    stage: one(crmPipelineStage, {
      fields: [crmOpportunity.stageId],
      references: [crmPipelineStage.id],
    }),
    activities: many(crmActivity),
    historyEntries: many(crmOpportunityStageHistory),
  }),
);

export const crmOpportunityStageHistoryRelations = relations(
  crmOpportunityStageHistory,
  ({ one }) => ({
    opportunity: one(crmOpportunity, {
      fields: [crmOpportunityStageHistory.opportunityId],
      references: [crmOpportunity.id],
    }),
    stage: one(crmPipelineStage, {
      fields: [crmOpportunityStageHistory.stageId],
      references: [crmPipelineStage.id],
    }),
    changedBy: one(user, {
      fields: [crmOpportunityStageHistory.changedById],
      references: [user.id],
    }),
  }),
);

export const crmActivityTypeRelations = relations(
  crmActivityType,
  ({ many }) => ({
    activities: many(crmActivity),
  }),
);

export const crmActivityRelations = relations(crmActivity, ({ one }) => ({
  workspace: one(workspace, {
    fields: [crmActivity.workspaceId],
    references: [workspace.id],
  }),
  account: one(crmAccount, {
    fields: [crmActivity.accountId],
    references: [crmAccount.id],
  }),
  contact: one(crmContact, {
    fields: [crmActivity.contactId],
    references: [crmContact.id],
  }),
  opportunity: one(crmOpportunity, {
    fields: [crmActivity.opportunityId],
    references: [crmOpportunity.id],
  }),
  type: one(crmActivityType, {
    fields: [crmActivity.typeId],
    references: [crmActivityType.id],
  }),
  performer: one(user, {
    fields: [crmActivity.performedById],
    references: [user.id],
  }),
}));

export const crmNoteRelations = relations(crmNote, ({ one }) => ({
  workspace: one(workspace, {
    fields: [crmNote.workspaceId],
    references: [workspace.id],
  }),
  account: one(crmAccount, {
    fields: [crmNote.accountId],
    references: [crmAccount.id],
  }),
  contact: one(crmContact, {
    fields: [crmNote.contactId],
    references: [crmContact.id],
  }),
  author: one(user, {
    fields: [crmNote.authorId],
    references: [user.id],
  }),
}));

export const productCategory = pgTable(
  "product_category",
  {
    ...sharedColumns,
    id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
    name: text("name").notNull(),
    description: text("description"),
    parentId: text("parent_id"),
  },
  (table) => ({
    parentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }),
  }),
);

export const product = pgTable("product", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  categoryId: text("category_id")
    .notNull()
    .references(() => productCategory.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status"),
});

export const productVariant = pgTable("product_variant", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  productId: text("product_id")
    .notNull()
    .references(() => product.id),
  sku: text("sku").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  currency: char("currency", { length: 3 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const productMedia = pgTable("product_media", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  productId: text("product_id")
    .notNull()
    .references(() => product.id),
  url: text("url").notNull(),
  type: text("type").notNull(),
});

export const inventoryLocation = pgTable("inventory_location", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  address: text("address"),
  region: text("region"),
});

export const inventoryItem = pgTable("inventory_item", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  variantId: text("variant_id")
    .notNull()
    .references(() => productVariant.id),
  serialNumber: text("serial_number"),
  metadata: jsonb("metadata"),
});

export const inventoryLevel = pgTable("inventory_level", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  locationId: text("location_id")
    .notNull()
    .references(() => inventoryLocation.id),
  variantId: text("variant_id")
    .notNull()
    .references(() => productVariant.id),
  quantity: integer("quantity").notNull(),
  reserved: integer("reserved").default(0).notNull(),
});

export const orderTable = pgTable("order", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  customerId: text("customer_id").references(() => user.id),
  opportunityId: text("opportunity_id").references(() => crmOpportunity.id),
  status: text("status").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  currency: char("currency", { length: 3 }).notNull(),
});

export const orderItem = pgTable("order_item", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  orderId: text("order_id")
    .notNull()
    .references(() => orderTable.id),
  variantId: text("variant_id")
    .notNull()
    .references(() => productVariant.id),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
});

export const payment = pgTable("payment", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  externalRef: text("external_ref"),
  status: text("status").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: char("currency", { length: 3 }).notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }),
  receivedById: text("received_by_id").references(() => user.id),
});

export const paymentRelations = relations(payment, ({ one }) => ({
  workspace: one(workspace, {
    fields: [payment.workspaceId],
    references: [workspace.id],
  }),
  receivedBy: one(user, {
    fields: [payment.receivedById],
    references: [user.id],
  }),
}));

export const orderPayment = pgTable("order_payment", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  orderId: text("order_id")
    .notNull()
    .references(() => orderTable.id),
  paymentId: text("payment_id").references(() => payment.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull(),
});

export const shipment = pgTable("shipment", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  orderId: text("order_id")
    .notNull()
    .references(() => orderTable.id),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  carrier: text("carrier"),
  trackingNumber: text("tracking_number"),
});

export const shipmentItem = pgTable("shipment_item", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  shipmentId: text("shipment_id")
    .notNull()
    .references(() => shipment.id),
  orderItemId: text("order_item_id")
    .notNull()
    .references(() => orderItem.id),
  quantity: integer("quantity").notNull(),
});

export const productCategoryRelations = relations(
  productCategory,
  ({ one, many }) => ({
    parent: one(productCategory, {
      fields: [productCategory.parentId],
      references: [productCategory.id],
    }),
    children: many(productCategory),
    products: many(product),
  }),
);

export const productRelations = relations(product, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [product.workspaceId],
    references: [workspace.id],
  }),
  category: one(productCategory, {
    fields: [product.categoryId],
    references: [productCategory.id],
  }),
  variants: many(productVariant),
  media: many(productMedia),
}));

export const productVariantRelations = relations(
  productVariant,
  ({ one, many }) => ({
    product: one(product, {
      fields: [productVariant.productId],
      references: [product.id],
    }),
    inventoryItems: many(inventoryItem),
    inventoryLevels: many(inventoryLevel),
    orderItems: many(orderItem),
  }),
);

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  workspace: one(workspace, {
    fields: [productMedia.workspaceId],
    references: [workspace.id],
  }),
  product: one(product, {
    fields: [productMedia.productId],
    references: [product.id],
  }),
}));

export const inventoryLocationRelations = relations(
  inventoryLocation,
  ({ many }) => ({
    levels: many(inventoryLevel),
  }),
);

export const inventoryItemRelations = relations(inventoryItem, ({ one }) => ({
  workspace: one(workspace, {
    fields: [inventoryItem.workspaceId],
    references: [workspace.id],
  }),
  variant: one(productVariant, {
    fields: [inventoryItem.variantId],
    references: [productVariant.id],
  }),
}));

export const inventoryLevelRelations = relations(inventoryLevel, ({ one }) => ({
  workspace: one(workspace, {
    fields: [inventoryLevel.workspaceId],
    references: [workspace.id],
  }),
  location: one(inventoryLocation, {
    fields: [inventoryLevel.locationId],
    references: [inventoryLocation.id],
  }),
  variant: one(productVariant, {
    fields: [inventoryLevel.variantId],
    references: [productVariant.id],
  }),
}));

export const orderRelations = relations(orderTable, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [orderTable.workspaceId],
    references: [workspace.id],
  }),
  customer: one(user, {
    fields: [orderTable.customerId],
    references: [user.id],
  }),
  opportunity: one(crmOpportunity, {
    fields: [orderTable.opportunityId],
    references: [crmOpportunity.id],
  }),
  items: many(orderItem),
  payments: many(orderPayment),
  shipments: many(shipment),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  workspace: one(workspace, {
    fields: [orderItem.workspaceId],
    references: [workspace.id],
  }),
  order: one(orderTable, {
    fields: [orderItem.orderId],
    references: [orderTable.id],
  }),
  variant: one(productVariant, {
    fields: [orderItem.variantId],
    references: [productVariant.id],
  }),
}));

export const orderPaymentRelations = relations(orderPayment, ({ one }) => ({
  workspace: one(workspace, {
    fields: [orderPayment.workspaceId],
    references: [workspace.id],
  }),
  order: one(orderTable, {
    fields: [orderPayment.orderId],
    references: [orderTable.id],
  }),
  payment: one(payment, {
    fields: [orderPayment.paymentId],
    references: [payment.id],
  }),
}));

export const shipmentRelations = relations(shipment, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [shipment.workspaceId],
    references: [workspace.id],
  }),
  order: one(orderTable, {
    fields: [shipment.orderId],
    references: [orderTable.id],
  }),
  items: many(shipmentItem),
}));

export const shipmentItemRelations = relations(shipmentItem, ({ one }) => ({
  workspace: one(workspace, {
    fields: [shipmentItem.workspaceId],
    references: [workspace.id],
  }),
  shipment: one(shipment, {
    fields: [shipmentItem.shipmentId],
    references: [shipment.id],
  }),
  orderItem: one(orderItem, {
    fields: [shipmentItem.orderItemId],
    references: [orderItem.id],
  }),
}));

export const department = pgTable("department", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  description: text("description"),
  managerId: text("manager_id").references(() => user.id),
});

export const team = pgTable("team", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  departmentId: text("department_id")
    .notNull()
    .references(() => department.id),
  leadId: text("lead_id").references(() => user.id),
  name: text("name").notNull(),
});

export const employeeProfile = pgTable("employee_profile", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  departmentId: text("department_id").references(() => department.id),
  teamId: text("team_id").references(() => team.id),
  title: text("title"),
  startDate: date("start_date"),
  employmentType: text("employment_type"),
});

export const employmentHistory = pgTable("employment_history", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employeeProfile.id),
  company: text("company").notNull(),
  title: text("title").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
});

export const employeeDocument = pgTable("employee_document", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employeeProfile.id),
  fileName: text("file_name").notNull(),
  documentType: text("document_type"),
  uploadedById: text("uploaded_by_id").references(() => user.id),
});

export const timesheet = pgTable("timesheet", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employeeProfile.id),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  submittedById: text("submitted_by_id").references(() => user.id),
  status: text("status").notNull(),
});

export const timeEntry = pgTable("time_entry", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  timesheetId: text("timesheet_id")
    .notNull()
    .references(() => timesheet.id),
  taskId: text("task_id").references(() => projectTask.id),
  hours: numeric("hours", { precision: 5, scale: 2 }).notNull(),
  notes: text("notes"),
  entryDate: date("entry_date").notNull(),
});

export const benefitPlan = pgTable("benefit_plan", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  provider: text("provider"),
  description: text("description"),
  administratorId: text("administrator_id").references(() => user.id),
});

export const benefitEnrollment = pgTable("benefit_enrollment", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  benefitPlanId: text("benefit_plan_id")
    .notNull()
    .references(() => benefitPlan.id),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employeeProfile.id),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull(),
  coverageLevel: text("coverage_level"),
});

export const departmentRelations = relations(department, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [department.workspaceId],
    references: [workspace.id],
  }),
  manager: one(user, {
    fields: [department.managerId],
    references: [user.id],
  }),
  teams: many(team),
  employees: many(employeeProfile),
}));

export const employeeProfileRelations = relations(
  employeeProfile,
  ({ one, many }) => ({
    user: one(user, {
      fields: [employeeProfile.userId],
      references: [user.id],
    }),
    department: one(department, {
      fields: [employeeProfile.departmentId],
      references: [department.id],
    }),
    team: one(team, {
      fields: [employeeProfile.teamId],
      references: [team.id],
    }),
    employmentHistory: many(employmentHistory),
    documents: many(employeeDocument),
    timesheets: many(timesheet),
    benefitEnrollments: many(benefitEnrollment),
  }),
);

export const teamRelations = relations(team, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [team.workspaceId],
    references: [workspace.id],
  }),
  department: one(department, {
    fields: [team.departmentId],
    references: [department.id],
  }),
  lead: one(user, {
    fields: [team.leadId],
    references: [user.id],
  }),
  employees: many(employeeProfile),
}));

export const employmentHistoryRelations = relations(
  employmentHistory,
  ({ one }) => ({
    employee: one(employeeProfile, {
      fields: [employmentHistory.employeeId],
      references: [employeeProfile.id],
    }),
  }),
);

export const employeeDocumentRelations = relations(
  employeeDocument,
  ({ one }) => ({
    employee: one(employeeProfile, {
      fields: [employeeDocument.employeeId],
      references: [employeeProfile.id],
    }),
    uploader: one(user, {
      fields: [employeeDocument.uploadedById],
      references: [user.id],
    }),
  }),
);

export const timesheetRelations = relations(timesheet, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [timesheet.workspaceId],
    references: [workspace.id],
  }),
  employee: one(employeeProfile, {
    fields: [timesheet.employeeId],
    references: [employeeProfile.id],
  }),
  submittedBy: one(user, {
    fields: [timesheet.submittedById],
    references: [user.id],
  }),
  entries: many(timeEntry),
}));

export const timeEntryRelations = relations(timeEntry, ({ one }) => ({
  workspace: one(workspace, {
    fields: [timeEntry.workspaceId],
    references: [workspace.id],
  }),
  timesheet: one(timesheet, {
    fields: [timeEntry.timesheetId],
    references: [timesheet.id],
  }),
  task: one(projectTask, {
    fields: [timeEntry.taskId],
    references: [projectTask.id],
  }),
}));

export const benefitPlanRelations = relations(benefitPlan, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [benefitPlan.workspaceId],
    references: [workspace.id],
  }),
  administrator: one(user, {
    fields: [benefitPlan.administratorId],
    references: [user.id],
  }),
  enrollments: many(benefitEnrollment),
}));

export const benefitEnrollmentRelations = relations(
  benefitEnrollment,
  ({ one }) => ({
    benefitPlan: one(benefitPlan, {
      fields: [benefitEnrollment.benefitPlanId],
      references: [benefitPlan.id],
    }),
    employee: one(employeeProfile, {
      fields: [benefitEnrollment.employeeId],
      references: [employeeProfile.id],
    }),
  }),
);

export const supportTicket = pgTable("support_ticket", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  customerId: text("customer_id").references(() => user.id),
  assignedTeamId: text("assigned_team_id").references(() => team.id),
  subject: text("subject").notNull(),
  status: text("status").notNull(),
  priority: text("priority"),
  source: text("source"),
});

export const supportTicketMessage = pgTable("support_ticket_message", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => supportTicket.id),
  authorId: text("author_id").references(() => user.id),
  body: text("body").notNull(),
  visibility: text("visibility"),
});

export const supportTicketTag = pgTable("support_ticket_tag", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  label: text("label").notNull(),
  description: text("description"),
});

export const supportTicketTagLink = pgTable("support_ticket_tag_link", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => supportTicket.id),
  tagId: text("tag_id")
    .notNull()
    .references(() => supportTicketTag.id),
});

export const supportTicketAssignment = pgTable("support_ticket_assignment", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => supportTicket.id),
  assigneeId: text("assignee_id").references(() => user.id),
  assignedAt: timestamp("assigned_at", { withTimezone: true }),
  assignmentType: text("assignment_type"),
});

export const supportTicketAudit = pgTable("support_ticket_audit", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => supportTicket.id),
  actorId: text("actor_id").references(() => user.id),
  action: text("action").notNull(),
  details: jsonb("details"),
});

export const supportTicketRelations = relations(
  supportTicket,
  ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [supportTicket.workspaceId],
    references: [workspace.id],
  }),
    customer: one(user, {
      fields: [supportTicket.customerId],
      references: [user.id],
    }),
    assignedTeam: one(team, {
      fields: [supportTicket.assignedTeamId],
      references: [team.id],
    }),
    messages: many(supportTicketMessage),
    tags: many(supportTicketTagLink),
    assignments: many(supportTicketAssignment),
    audits: many(supportTicketAudit),
  }),
);

export const supportTicketMessageRelations = relations(
  supportTicketMessage,
  ({ one }) => ({
  workspace: one(workspace, {
    fields: [supportTicketMessage.workspaceId],
    references: [workspace.id],
  }),
    ticket: one(supportTicket, {
      fields: [supportTicketMessage.ticketId],
      references: [supportTicket.id],
    }),
    author: one(user, {
      fields: [supportTicketMessage.authorId],
      references: [user.id],
    }),
  }),
);

export const supportTicketTagRelations = relations(
  supportTicketTag,
  ({ many }) => ({
  workspace: one(workspace, {
    fields: [supportTicketTag.workspaceId],
    references: [workspace.id],
  }),
    ticketLinks: many(supportTicketTagLink),
  }),
);

export const supportTicketTagLinkRelations = relations(
  supportTicketTagLink,
  ({ one }) => ({
  workspace: one(workspace, {
    fields: [supportTicketTagLink.workspaceId],
    references: [workspace.id],
  }),
    ticket: one(supportTicket, {
      fields: [supportTicketTagLink.ticketId],
      references: [supportTicket.id],
    }),
    tag: one(supportTicketTag, {
      fields: [supportTicketTagLink.tagId],
      references: [supportTicketTag.id],
    }),
  }),
);

export const supportTicketAssignmentRelations = relations(
  supportTicketAssignment,
  ({ one }) => ({
  workspace: one(workspace, {
    fields: [supportTicketAssignment.workspaceId],
    references: [workspace.id],
  }),
    ticket: one(supportTicket, {
      fields: [supportTicketAssignment.ticketId],
      references: [supportTicket.id],
    }),
    assignee: one(user, {
      fields: [supportTicketAssignment.assigneeId],
      references: [user.id],
    }),
  }),
);

export const supportTicketAuditRelations = relations(
  supportTicketAudit,
  ({ one }) => ({
  workspace: one(workspace, {
    fields: [supportTicketAudit.workspaceId],
    references: [workspace.id],
  }),
    ticket: one(supportTicket, {
      fields: [supportTicketAudit.ticketId],
      references: [supportTicket.id],
    }),
    actor: one(user, {
      fields: [supportTicketAudit.actorId],
      references: [user.id],
    }),
  }),
);

export const billingInvoice = pgTable("billing_invoice", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  accountId: text("account_id")
    .notNull()
    .references(() => crmAccount.id),
  contactId: text("contact_id").references(() => crmContact.id),
  issuedById: text("issued_by_id").references(() => user.id),
  status: text("status").notNull(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  currency: char("currency", { length: 3 }).notNull(),
});

export const billingInvoiceLine = pgTable("billing_invoice_line", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => billingInvoice.id),
  orderItemId: text("order_item_id").references(() => orderItem.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
});

export const expenseReport = pgTable("expense_report", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id),
  departmentId: text("department_id").references(() => department.id),
  status: text("status").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
});

export const expenseItem = pgTable("expense_item", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  reportId: text("report_id")
    .notNull()
    .references(() => expenseReport.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  incurredAt: date("incurred_at"),
  merchant: text("merchant"),
  notes: text("notes"),
});

export const ledgerAccount = pgTable(
  "ledger_account",
  {
    ...sharedColumns,
    id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
    name: text("name").notNull(),
    code: text("code").notNull(),
    accountType: text("account_type").notNull(),
    parentAccountId: text("parent_account_id"),
  },
  (table) => ({
    parentFk: foreignKey({
      columns: [table.parentAccountId],
      foreignColumns: [table.id],
    }),
  }),
);

export const ledgerTransaction = pgTable("ledger_transaction", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  reference: text("reference"),
  transactionDate: date("transaction_date").notNull(),
  createdById: text("created_by_id").references(() => user.id),
  description: text("description"),
});

export const ledgerEntry = pgTable("ledger_entry", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => ledgerTransaction.id),
  accountId: text("account_id")
    .notNull()
    .references(() => ledgerAccount.id),
  debit: numeric("debit", { precision: 12, scale: 2 }),
  credit: numeric("credit", { precision: 12, scale: 2 }),
  memo: text("memo"),
});

export const budget = pgTable("budget", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  departmentId: text("department_id").references(() => department.id),
  fiscalYear: integer("fiscal_year").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  currency: char("currency", { length: 3 }).notNull(),
});

export const budgetLine = pgTable("budget_line", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  budgetId: text("budget_id")
    .notNull()
    .references(() => budget.id),
  accountId: text("account_id")
    .notNull()
    .references(() => ledgerAccount.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
});

export const billingInvoiceRelations = relations(
  billingInvoice,
  ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [billingInvoice.workspaceId],
    references: [workspace.id],
  }),
    account: one(crmAccount, {
      fields: [billingInvoice.accountId],
      references: [crmAccount.id],
    }),
    contact: one(crmContact, {
      fields: [billingInvoice.contactId],
      references: [crmContact.id],
    }),
    issuer: one(user, {
      fields: [billingInvoice.issuedById],
      references: [user.id],
    }),
    lines: many(billingInvoiceLine),
  }),
);

export const billingInvoiceLineRelations = relations(
  billingInvoiceLine,
  ({ one }) => ({
  workspace: one(workspace, {
    fields: [billingInvoiceLine.workspaceId],
    references: [workspace.id],
  }),
    invoice: one(billingInvoice, {
      fields: [billingInvoiceLine.invoiceId],
      references: [billingInvoice.id],
    }),
    orderItem: one(orderItem, {
      fields: [billingInvoiceLine.orderItemId],
      references: [orderItem.id],
    }),
  }),
);

export const expenseReportRelations = relations(
  expenseReport,
  ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [expenseReport.workspaceId],
    references: [workspace.id],
  }),
    owner: one(user, {
      fields: [expenseReport.ownerId],
      references: [user.id],
    }),
    department: one(department, {
      fields: [expenseReport.departmentId],
      references: [department.id],
    }),
    items: many(expenseItem),
  }),
);

export const expenseItemRelations = relations(expenseItem, ({ one }) => ({
  workspace: one(workspace, {
    fields: [expenseItem.workspaceId],
    references: [workspace.id],
  }),
  report: one(expenseReport, {
    fields: [expenseItem.reportId],
    references: [expenseReport.id],
  }),
}));

export const ledgerAccountRelations = relations(
  ledgerAccount,
  ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [ledgerAccount.workspaceId],
    references: [workspace.id],
  }),
    parent: one(ledgerAccount, {
      fields: [ledgerAccount.parentAccountId],
      references: [ledgerAccount.id],
    }),
    children: many(ledgerAccount),
    entries: many(ledgerEntry),
    budgetLines: many(budgetLine),
  }),
);

export const ledgerTransactionRelations = relations(
  ledgerTransaction,
  ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [ledgerTransaction.workspaceId],
    references: [workspace.id],
  }),
    creator: one(user, {
      fields: [ledgerTransaction.createdById],
      references: [user.id],
    }),
    entries: many(ledgerEntry),
  }),
);

export const ledgerEntryRelations = relations(ledgerEntry, ({ one }) => ({
  workspace: one(workspace, {
    fields: [ledgerEntry.workspaceId],
    references: [workspace.id],
  }),
  transaction: one(ledgerTransaction, {
    fields: [ledgerEntry.transactionId],
    references: [ledgerTransaction.id],
  }),
  account: one(ledgerAccount, {
    fields: [ledgerEntry.accountId],
    references: [ledgerAccount.id],
  }),
}));

export const budgetRelations = relations(budget, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [budget.workspaceId],
    references: [workspace.id],
  }),
  department: one(department, {
    fields: [budget.departmentId],
    references: [department.id],
  }),
  lines: many(budgetLine),
}));

export const budgetLineRelations = relations(budgetLine, ({ one }) => ({
  workspace: one(workspace, {
    fields: [budgetLine.workspaceId],
    references: [workspace.id],
  }),
  budget: one(budget, {
    fields: [budgetLine.budgetId],
    references: [budget.id],
  }),
  account: one(ledgerAccount, {
    fields: [budgetLine.accountId],
    references: [ledgerAccount.id],
  }),
}));

export const marketingCampaign = pgTable("marketing_campaign", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  ownerId: text("owner_id").references(() => user.id),
  name: text("name").notNull(),
  status: text("status").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  budgetAmount: numeric("budget_amount", { precision: 12, scale: 2 }),
});

export const marketingChannel = pgTable("marketing_channel", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  channelType: text("channel_type"),
  costModel: text("cost_model"),
});

export const marketingCampaignChannel = pgTable("marketing_campaign_channel", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => marketingCampaign.id),
  channelId: text("channel_id")
    .notNull()
    .references(() => marketingChannel.id),
  allocation: numeric("allocation", { precision: 12, scale: 2 }),
});

export const marketingAudience = pgTable("marketing_audience", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  segmentType: text("segment_type"),
  definition: jsonb("definition"),
});

export const marketingCampaignAudience = pgTable(
  "marketing_campaign_audience",
  {
    ...sharedColumns,
    id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => marketingCampaign.id),
    audienceId: text("audience_id")
      .notNull()
      .references(() => marketingAudience.id),
  },
);

export const marketingCampaignRelations = relations(
  marketingCampaign,
  ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [marketingCampaign.workspaceId],
    references: [workspace.id],
  }),
    owner: one(user, {
      fields: [marketingCampaign.ownerId],
      references: [user.id],
    }),
    channels: many(marketingCampaignChannel),
    audiences: many(marketingCampaignAudience),
  }),
);

export const marketingChannelRelations = relations(
  marketingChannel,
  ({ many }) => ({
  workspace: one(workspace, {
    fields: [marketingChannel.workspaceId],
    references: [workspace.id],
  }),
    campaignChannels: many(marketingCampaignChannel),
  }),
);

export const marketingCampaignChannelRelations = relations(
  marketingCampaignChannel,
  ({ one }) => ({
  workspace: one(workspace, {
    fields: [marketingCampaignChannel.workspaceId],
    references: [workspace.id],
  }),
    campaign: one(marketingCampaign, {
      fields: [marketingCampaignChannel.campaignId],
      references: [marketingCampaign.id],
    }),
    channel: one(marketingChannel, {
      fields: [marketingCampaignChannel.channelId],
      references: [marketingChannel.id],
    }),
  }),
);

export const marketingAudienceRelations = relations(
  marketingAudience,
  ({ many }) => ({
  workspace: one(workspace, {
    fields: [marketingAudience.workspaceId],
    references: [workspace.id],
  }),
    campaignAudiences: many(marketingCampaignAudience),
  }),
);

export const marketingCampaignAudienceRelations = relations(
  marketingCampaignAudience,
  ({ one }) => ({
  workspace: one(workspace, {
    fields: [marketingCampaignAudience.workspaceId],
    references: [workspace.id],
  }),
    campaign: one(marketingCampaign, {
      fields: [marketingCampaignAudience.campaignId],
      references: [marketingCampaign.id],
    }),
    audience: one(marketingAudience, {
      fields: [marketingCampaignAudience.audienceId],
      references: [marketingAudience.id],
    }),
  }),
);

export const analyticsDashboard = pgTable("analytics_dashboard", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  ownerId: text("owner_id").references(() => user.id),
  title: text("title").notNull(),
  description: text("description"),
});

export const analyticsWidget = pgTable("analytics_widget", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  dashboardId: text("dashboard_id")
    .notNull()
    .references(() => analyticsDashboard.id),
  title: text("title").notNull(),
  widgetType: text("widget_type").notNull(),
  position: integer("position"),
});

export const analyticsWidgetQuery = pgTable("analytics_widget_query", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  widgetId: text("widget_id")
    .notNull()
    .references(() => analyticsWidget.id),
  dataSource: text("data_source").notNull(),
  query: text("query").notNull(),
  refreshIntervalSeconds: integer("refresh_interval_seconds"),
});

export const analyticsDashboardRelations = relations(
  analyticsDashboard,
  ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [analyticsDashboard.workspaceId],
    references: [workspace.id],
  }),
    owner: one(user, {
      fields: [analyticsDashboard.ownerId],
      references: [user.id],
    }),
    widgets: many(analyticsWidget),
  }),
);

export const analyticsWidgetRelations = relations(
  analyticsWidget,
  ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [analyticsWidget.workspaceId],
    references: [workspace.id],
  }),
    dashboard: one(analyticsDashboard, {
      fields: [analyticsWidget.dashboardId],
      references: [analyticsDashboard.id],
    }),
    queries: many(analyticsWidgetQuery),
  }),
);

export const analyticsWidgetQueryRelations = relations(
  analyticsWidgetQuery,
  ({ one }) => ({
  workspace: one(workspace, {
    fields: [analyticsWidgetQuery.workspaceId],
    references: [workspace.id],
  }),
    widget: one(analyticsWidget, {
      fields: [analyticsWidgetQuery.widgetId],
      references: [analyticsWidget.id],
    }),
  }),
);

export const integrationWebhook = pgTable("integration_webhook", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  projectId: text("project_id").references(() => project.id),
  accountId: text("account_id").references(() => crmAccount.id),
  name: text("name").notNull(),
  url: text("url").notNull(),
  secret: text("secret"),
  isActive: boolean("is_active").notNull().default(true),
});

export const integrationEvent = pgTable("integration_event", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  webhookId: text("webhook_id")
    .notNull()
    .references(() => integrationWebhook.id),
  payload: jsonb("payload"),
  eventType: text("event_type").notNull(),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  status: text("status").notNull(),
});

export const integrationWebhookRelations = relations(
  integrationWebhook,
  ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [integrationWebhook.workspaceId],
    references: [workspace.id],
  }),
    project: one(project, {
      fields: [integrationWebhook.projectId],
      references: [project.id],
    }),
    account: one(crmAccount, {
      fields: [integrationWebhook.accountId],
      references: [crmAccount.id],
    }),
    events: many(integrationEvent),
  }),
);

export const integrationEventRelations = relations(
  integrationEvent,
  ({ one }) => ({
  workspace: one(workspace, {
    fields: [integrationEvent.workspaceId],
    references: [workspace.id],
  }),
    webhook: one(integrationWebhook, {
      fields: [integrationEvent.webhookId],
      references: [integrationWebhook.id],
    }),
  }),
);

export const integrationCredential = pgTable("integration_credential", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  webhookId: text("webhook_id").references(() => integrationWebhook.id),
  provider: text("provider").notNull(),
  clientId: text("client_id"),
  clientSecret: text("client_secret"),
  metadata: jsonb("metadata"),
});

export const integrationCredentialRelations = relations(
  integrationCredential,
  ({ one }) => ({
  workspace: one(workspace, {
    fields: [integrationCredential.workspaceId],
    references: [workspace.id],
  }),
    webhook: one(integrationWebhook, {
      fields: [integrationCredential.webhookId],
      references: [integrationWebhook.id],
    }),
  }),
);

export const documentLibrary = pgTable("document_library", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  projectId: text("project_id").references(() => project.id),
  name: text("name").notNull(),
  description: text("description"),
  visibility: text("visibility"),
});

export const documentFolder = pgTable(
  "document_folder",
  {
    ...sharedColumns,
    id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
    libraryId: text("library_id")
      .notNull()
      .references(() => documentLibrary.id),
    parentId: text("parent_id"),
    name: text("name").notNull(),
  },
  (table) => ({
    parentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }),
  }),
);

export const documentFile = pgTable("document_file", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  folderId: text("folder_id")
    .notNull()
    .references(() => documentFolder.id),
  uploadedById: text("uploaded_by_id").references(() => user.id),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  version: integer("version").notNull().default(1),
});

export const documentFileVersion = pgTable("document_file_version", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  fileId: text("file_id")
    .notNull()
    .references(() => documentFile.id),
  uploadedById: text("uploaded_by_id").references(() => user.id),
  version: integer("version").notNull(),
  changeLog: text("change_log"),
  fileSizeBytes: integer("file_size_bytes"),
});

export const documentSharing = pgTable("document_sharing", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  fileId: text("file_id")
    .notNull()
    .references(() => documentFile.id),
  sharedWithUserId: text("shared_with_user_id").references(() => user.id),
  sharedWithTeamId: text("shared_with_team_id").references(() => team.id),
  permission: text("permission").notNull(),
});

export const documentLibraryRelations = relations(
  documentLibrary,
  ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [documentLibrary.workspaceId],
    references: [workspace.id],
  }),
    project: one(project, {
      fields: [documentLibrary.projectId],
      references: [project.id],
    }),
    folders: many(documentFolder),
  }),
);

export const documentFolderRelations = relations(
  documentFolder,
  ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [documentFolder.workspaceId],
    references: [workspace.id],
  }),
    library: one(documentLibrary, {
      fields: [documentFolder.libraryId],
      references: [documentLibrary.id],
    }),
    parent: one(documentFolder, {
      fields: [documentFolder.parentId],
      references: [documentFolder.id],
    }),
    children: many(documentFolder),
    files: many(documentFile),
  }),
);

export const documentFileRelations = relations(
  documentFile,
  ({ one, many }) => ({
    folder: one(documentFolder, {
      fields: [documentFile.folderId],
      references: [documentFolder.id],
    }),
    uploader: one(user, {
      fields: [documentFile.uploadedById],
      references: [user.id],
    }),
    versions: many(documentFileVersion),
    sharings: many(documentSharing),
  }),
);

export const documentFileVersionRelations = relations(
  documentFileVersion,
  ({ one }) => ({
    file: one(documentFile, {
      fields: [documentFileVersion.fileId],
      references: [documentFile.id],
    }),
    uploader: one(user, {
      fields: [documentFileVersion.uploadedById],
      references: [user.id],
    }),
  }),
);

export const documentSharingRelations = relations(
  documentSharing,
  ({ one }) => ({
    file: one(documentFile, {
      fields: [documentSharing.fileId],
      references: [documentFile.id],
    }),
    user: one(user, {
      fields: [documentSharing.sharedWithUserId],
      references: [user.id],
    }),
    team: one(team, {
      fields: [documentSharing.sharedWithTeamId],
      references: [team.id],
    }),
  }),
);

// ============================================================================
// WORKSPACE & MULTI-TENANCY (5 tables)
// ============================================================================

export const workspace = pgTable("workspace", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  subscriptionTier: text("subscription_tier"),
  billingEmail: text("billing_email").$type<`${string}@${string}`>(),
  settings: jsonb("settings").$type<{ theme: string; notifications: boolean }>(),
});

export const workspaceRelations = relations(workspace, ({ many }) => ({
  memberships: many(workspaceMembership),
  invitations: many(workspaceInvitation),
  apiKeys: many(workspaceApiKey),
  auditLogs: many(workspaceAuditLog),
}));

export const workspaceMembership = pgTable("workspace_membership", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  role: text("role").notNull(),
  invitedAt: timestamp("invited_at"),
  joinedAt: timestamp("joined_at"),
});

export const workspaceMembershipRelations = relations(
  workspaceMembership,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [workspaceMembership.workspaceId],
      references: [workspace.id],
    }),
    user: one(user, {
      fields: [workspaceMembership.userId],
      references: [user.id],
    }),
  }),
);

export const workspaceInvitation = pgTable("workspace_invitation", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  email: text("email").$type<`${string}@${string}`>().notNull(),
  role: text("role").notNull(),
  invitedBy: text("invited_by").references(() => user.id),
  expiresAt: timestamp("expires_at"),
  acceptedAt: timestamp("accepted_at"),
});

export const workspaceInvitationRelations = relations(
  workspaceInvitation,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [workspaceInvitation.workspaceId],
      references: [workspace.id],
    }),
    inviter: one(user, {
      fields: [workspaceInvitation.invitedBy],
      references: [user.id],
    }),
  }),
);

export const workspaceApiKey = pgTable("workspace_api_key", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  createdBy: text("created_by").references(() => user.id),
  lastUsedAt: timestamp("last_used_at"),
});

export const workspaceApiKeyRelations = relations(
  workspaceApiKey,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [workspaceApiKey.workspaceId],
      references: [workspace.id],
    }),
    creator: one(user, {
      fields: [workspaceApiKey.createdBy],
      references: [user.id],
    }),
  }),
);

export const workspaceAuditLog = pgTable("workspace_audit_log", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  userId: text("user_id").references(() => user.id),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

export const workspaceAuditLogRelations = relations(
  workspaceAuditLog,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [workspaceAuditLog.workspaceId],
      references: [workspace.id],
    }),
    user: one(user, {
      fields: [workspaceAuditLog.userId],
      references: [user.id],
    }),
  }),
);

// ============================================================================
// ENHANCED CRM MODULE (25 tables)
// ============================================================================

// Lead Management
export const crmLead = pgTable("crm_lead", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").$type<`${string}@${string}`>(),
  phone: text("phone"),
  company: text("company"),
  title: text("title"),
  sourceId: text("source_id").references(() => crmLeadSource.id),
  ownerId: text("owner_id").references(() => user.id),
  status: text("status").notNull(),
  score: integer("score"),
});

export const crmLeadRelations = relations(crmLead, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [crmLead.workspaceId],
    references: [workspace.id],
  }),
  source: one(crmLeadSource, {
    fields: [crmLead.sourceId],
    references: [crmLeadSource.id],
  }),
  owner: one(user, {
    fields: [crmLead.ownerId],
    references: [user.id],
  }),
  activities: many(crmLeadActivity),
  assignments: many(crmLeadAssignment),
  customFieldValues: many(crmLeadCustomFieldValue),
}));

export const crmLeadSource = pgTable("crm_lead_source", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
});

export const crmLeadSourceRelations = relations(
  crmLeadSource,
  ({ one, many }) => ({
    workspace: one(workspace, {
      fields: [crmLeadSource.workspaceId],
      references: [workspace.id],
    }),
    leads: many(crmLead),
  }),
);

export const crmLeadScore = pgTable("crm_lead_score", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  leadId: text("lead_id")
    .notNull()
    .references(() => crmLead.id),
  score: integer("score").notNull(),
  reason: text("reason"),
  scoredAt: timestamp("scored_at").notNull(),
});

export const crmLeadScoreRelations = relations(crmLeadScore, ({ one }) => ({
  workspace: one(workspace, {
    fields: [crmLeadScore.workspaceId],
    references: [workspace.id],
  }),
  lead: one(crmLead, {
    fields: [crmLeadScore.leadId],
    references: [crmLead.id],
  }),
}));

export const crmLeadActivity = pgTable("crm_lead_activity", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  leadId: text("lead_id")
    .notNull()
    .references(() => crmLead.id),
  userId: text("user_id").references(() => user.id),
  activityType: text("activity_type").notNull(),
  description: text("description"),
  activityDate: timestamp("activity_date").notNull(),
});

export const crmLeadActivityRelations = relations(
  crmLeadActivity,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [crmLeadActivity.workspaceId],
      references: [workspace.id],
    }),
    lead: one(crmLead, {
      fields: [crmLeadActivity.leadId],
      references: [crmLead.id],
    }),
    user: one(user, {
      fields: [crmLeadActivity.userId],
      references: [user.id],
    }),
  }),
);

export const crmLeadAssignment = pgTable("crm_lead_assignment", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  leadId: text("lead_id")
    .notNull()
    .references(() => crmLead.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  assignedAt: timestamp("assigned_at").notNull(),
});

export const crmLeadAssignmentRelations = relations(
  crmLeadAssignment,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [crmLeadAssignment.workspaceId],
      references: [workspace.id],
    }),
    lead: one(crmLead, {
      fields: [crmLeadAssignment.leadId],
      references: [crmLead.id],
    }),
    user: one(user, {
      fields: [crmLeadAssignment.userId],
      references: [user.id],
    }),
  }),
);

export const crmLeadCustomField = pgTable("crm_lead_custom_field", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  name: text("name").notNull(),
  fieldType: text("field_type").notNull(),
  options: jsonb("options").$type<string[]>(),
});

export const crmLeadCustomFieldRelations = relations(
  crmLeadCustomField,
  ({ one, many }) => ({
    workspace: one(workspace, {
      fields: [crmLeadCustomField.workspaceId],
      references: [workspace.id],
    }),
    values: many(crmLeadCustomFieldValue),
  }),
);

export const crmLeadCustomFieldValue = pgTable("crm_lead_custom_field_value", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  leadId: text("lead_id")
    .notNull()
    .references(() => crmLead.id),
  fieldId: text("field_id")
    .notNull()
    .references(() => crmLeadCustomField.id),
  value: text("value"),
});

export const crmLeadCustomFieldValueRelations = relations(
  crmLeadCustomFieldValue,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [crmLeadCustomFieldValue.workspaceId],
      references: [workspace.id],
    }),
    lead: one(crmLead, {
      fields: [crmLeadCustomFieldValue.leadId],
      references: [crmLead.id],
    }),
    field: one(crmLeadCustomField, {
      fields: [crmLeadCustomFieldValue.fieldId],
      references: [crmLeadCustomField.id],
    }),
  }),
);

// Enhanced Opportunities
export const opportunityLineItem = pgTable("opportunity_line_item", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  opportunityId: text("opportunity_id")
    .notNull()
    .references(() => opportunity.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
});

export const opportunityLineItemRelations = relations(
  opportunityLineItem,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [opportunityLineItem.workspaceId],
      references: [workspace.id],
    }),
    opportunity: one(opportunity, {
      fields: [opportunityLineItem.opportunityId],
      references: [opportunity.id],
    }),
  }),
);

export const opportunityCompetitor = pgTable("opportunity_competitor", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  opportunityId: text("opportunity_id")
    .notNull()
    .references(() => opportunity.id),
  competitorName: text("competitor_name").notNull(),
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  notes: text("notes"),
});

export const opportunityCompetitorRelations = relations(
  opportunityCompetitor,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [opportunityCompetitor.workspaceId],
      references: [workspace.id],
    }),
    opportunity: one(opportunity, {
      fields: [opportunityCompetitor.opportunityId],
      references: [opportunity.id],
    }),
  }),
);

export const opportunityStakeholder = pgTable("opportunity_stakeholder", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  opportunityId: text("opportunity_id")
    .notNull()
    .references(() => opportunity.id),
  contactId: text("contact_id")
    .notNull()
    .references(() => crmContact.id),
  role: text("role").notNull(),
  influence: text("influence"),
});

export const opportunityStakeholderRelations = relations(
  opportunityStakeholder,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [opportunityStakeholder.workspaceId],
      references: [workspace.id],
    }),
    opportunity: one(opportunity, {
      fields: [opportunityStakeholder.opportunityId],
      references: [opportunity.id],
    }),
    contact: one(crmContact, {
      fields: [opportunityStakeholder.contactId],
      references: [crmContact.id],
    }),
  }),
);

export const opportunityDocument = pgTable("opportunity_document", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  opportunityId: text("opportunity_id")
    .notNull()
    .references(() => opportunity.id),
  documentName: text("document_name").notNull(),
  documentUrl: text("document_url").notNull(),
  uploadedBy: text("uploaded_by").references(() => user.id),
});

export const opportunityDocumentRelations = relations(
  opportunityDocument,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [opportunityDocument.workspaceId],
      references: [workspace.id],
    }),
    opportunity: one(opportunity, {
      fields: [opportunityDocument.opportunityId],
      references: [opportunity.id],
    }),
    uploader: one(user, {
      fields: [opportunityDocument.uploadedBy],
      references: [user.id],
    }),
  }),
);

export const opportunityTimeline = pgTable("opportunity_timeline", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  opportunityId: text("opportunity_id")
    .notNull()
    .references(() => opportunity.id),
  eventType: text("event_type").notNull(),
  eventDescription: text("event_description").notNull(),
  userId: text("user_id").references(() => user.id),
  eventDate: timestamp("event_date").notNull(),
});

export const opportunityTimelineRelations = relations(
  opportunityTimeline,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [opportunityTimeline.workspaceId],
      references: [workspace.id],
    }),
    opportunity: one(opportunity, {
      fields: [opportunityTimeline.opportunityId],
      references: [opportunity.id],
    }),
    user: one(user, {
      fields: [opportunityTimeline.userId],
      references: [user.id],
    }),
  }),
);

// Account Hierarchy
export const crmAccountHierarchy = pgTable("crm_account_hierarchy", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  parentAccountId: text("parent_account_id")
    .notNull()
    .references(() => crmAccount.id),
  childAccountId: text("child_account_id")
    .notNull()
    .references(() => crmAccount.id),
  relationshipType: text("relationship_type"),
});

export const crmAccountHierarchyRelations = relations(
  crmAccountHierarchy,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [crmAccountHierarchy.workspaceId],
      references: [workspace.id],
    }),
    parentAccount: one(crmAccount, {
      fields: [crmAccountHierarchy.parentAccountId],
      references: [crmAccount.id],
    }),
    childAccount: one(crmAccount, {
      fields: [crmAccountHierarchy.childAccountId],
      references: [crmAccount.id],
    }),
  }),
);

export const crmAccountTerritory = pgTable("crm_account_territory", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  name: text("name").notNull(),
  region: text("region"),
  managerId: text("manager_id").references(() => user.id),
});

export const crmAccountTerritoryRelations = relations(
  crmAccountTerritory,
  ({ one, many }) => ({
    workspace: one(workspace, {
      fields: [crmAccountTerritory.workspaceId],
      references: [workspace.id],
    }),
    manager: one(user, {
      fields: [crmAccountTerritory.managerId],
      references: [user.id],
    }),
    assignments: many(crmTerritoryAssignment),
  }),
);

export const crmTerritoryAssignment = pgTable("crm_territory_assignment", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  territoryId: text("territory_id")
    .notNull()
    .references(() => crmAccountTerritory.id),
  accountId: text("account_id")
    .notNull()
    .references(() => crmAccount.id),
  assignedAt: timestamp("assigned_at").notNull(),
});

export const crmTerritoryAssignmentRelations = relations(
  crmTerritoryAssignment,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [crmTerritoryAssignment.workspaceId],
      references: [workspace.id],
    }),
    territory: one(crmAccountTerritory, {
      fields: [crmTerritoryAssignment.territoryId],
      references: [crmAccountTerritory.id],
    }),
    account: one(crmAccount, {
      fields: [crmTerritoryAssignment.accountId],
      references: [crmAccount.id],
    }),
  }),
);

export const crmAccountIndustry = pgTable("crm_account_industry", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  accountId: text("account_id")
    .notNull()
    .references(() => crmAccount.id),
  industryName: text("industry_name").notNull(),
  subIndustry: text("sub_industry"),
});

export const crmAccountIndustryRelations = relations(
  crmAccountIndustry,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [crmAccountIndustry.workspaceId],
      references: [workspace.id],
    }),
    account: one(crmAccount, {
      fields: [crmAccountIndustry.accountId],
      references: [crmAccount.id],
    }),
  }),
);

// Advanced Contact Management
export const crmContactRole = pgTable("crm_contact_role", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  contactId: text("contact_id")
    .notNull()
    .references(() => crmContact.id),
  roleName: text("role_name").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
});

export const crmContactRoleRelations = relations(
  crmContactRole,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [crmContactRole.workspaceId],
      references: [workspace.id],
    }),
    contact: one(crmContact, {
      fields: [crmContactRole.contactId],
      references: [crmContact.id],
    }),
  }),
);

export const crmContactPreference = pgTable("crm_contact_preference", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  contactId: text("contact_id")
    .notNull()
    .references(() => crmContact.id),
  preferenceKey: text("preference_key").notNull(),
  preferenceValue: text("preference_value").notNull(),
});

export const crmContactPreferenceRelations = relations(
  crmContactPreference,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [crmContactPreference.workspaceId],
      references: [workspace.id],
    }),
    contact: one(crmContact, {
      fields: [crmContactPreference.contactId],
      references: [crmContact.id],
    }),
  }),
);

export const crmContactSocialProfile = pgTable("crm_contact_social_profile", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  contactId: text("contact_id")
    .notNull()
    .references(() => crmContact.id),
  platform: text("platform").notNull(),
  profileUrl: text("profile_url").notNull(),
});

export const crmContactSocialProfileRelations = relations(
  crmContactSocialProfile,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [crmContactSocialProfile.workspaceId],
      references: [workspace.id],
    }),
    contact: one(crmContact, {
      fields: [crmContactSocialProfile.contactId],
      references: [crmContact.id],
    }),
  }),
);

export const crmContactEngagement = pgTable("crm_contact_engagement", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  contactId: text("contact_id")
    .notNull()
    .references(() => crmContact.id),
  engagementType: text("engagement_type").notNull(),
  engagementScore: integer("engagement_score"),
  lastEngagement: timestamp("last_engagement"),
});

export const crmContactEngagementRelations = relations(
  crmContactEngagement,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [crmContactEngagement.workspaceId],
      references: [workspace.id],
    }),
    contact: one(crmContact, {
      fields: [crmContactEngagement.contactId],
      references: [crmContact.id],
    }),
  }),
);

export const crmContactDuplicates = pgTable("crm_contact_duplicates", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  contact1Id: text("contact_1_id")
    .notNull()
    .references(() => crmContact.id),
  contact2Id: text("contact_2_id")
    .notNull()
    .references(() => crmContact.id),
  similarityScore: integer("similarity_score"),
  resolvedAt: timestamp("resolved_at"),
});

export const crmContactDuplicatesRelations = relations(
  crmContactDuplicates,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [crmContactDuplicates.workspaceId],
      references: [workspace.id],
    }),
    contact1: one(crmContact, {
      fields: [crmContactDuplicates.contact1Id],
      references: [crmContact.id],
    }),
    contact2: one(crmContact, {
      fields: [crmContactDuplicates.contact2Id],
      references: [crmContact.id],
    }),
  }),
);

// Sales Automation
export const crmSalesSequence = pgTable("crm_sales_sequence", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: text("created_by").references(() => user.id),
});

export const crmSalesSequenceRelations = relations(
  crmSalesSequence,
  ({ one, many }) => ({
    workspace: one(workspace, {
      fields: [crmSalesSequence.workspaceId],
      references: [workspace.id],
    }),
    creator: one(user, {
      fields: [crmSalesSequence.createdBy],
      references: [user.id],
    }),
    steps: many(crmSalesSequenceStep),
    enrollments: many(crmSalesSequenceEnrollment),
  }),
);

export const crmSalesSequenceStep = pgTable("crm_sales_sequence_step", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  sequenceId: text("sequence_id")
    .notNull()
    .references(() => crmSalesSequence.id),
  stepOrder: integer("step_order").notNull(),
  stepType: text("step_type").notNull(),
  content: text("content"),
  delayDays: integer("delay_days").notNull(),
});

export const crmSalesSequenceStepRelations = relations(
  crmSalesSequenceStep,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [crmSalesSequenceStep.workspaceId],
      references: [workspace.id],
    }),
    sequence: one(crmSalesSequence, {
      fields: [crmSalesSequenceStep.sequenceId],
      references: [crmSalesSequence.id],
    }),
  }),
);

export const crmSalesSequenceEnrollment = pgTable(
  "crm_sales_sequence_enrollment",
  {
    ...sharedColumns,
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id),
    sequenceId: text("sequence_id")
      .notNull()
      .references(() => crmSalesSequence.id),
    contactId: text("contact_id")
      .notNull()
      .references(() => crmContact.id),
    enrolledBy: text("enrolled_by").references(() => user.id),
    enrolledAt: timestamp("enrolled_at").notNull(),
    currentStepId: text("current_step_id").references(
      () => crmSalesSequenceStep.id,
    ),
    status: text("status").notNull(),
  },
);

export const crmSalesSequenceEnrollmentRelations = relations(
  crmSalesSequenceEnrollment,
  ({ one, many }) => ({
    workspace: one(workspace, {
      fields: [crmSalesSequenceEnrollment.workspaceId],
      references: [workspace.id],
    }),
    sequence: one(crmSalesSequence, {
      fields: [crmSalesSequenceEnrollment.sequenceId],
      references: [crmSalesSequence.id],
    }),
    contact: one(crmContact, {
      fields: [crmSalesSequenceEnrollment.contactId],
      references: [crmContact.id],
    }),
    enrolledByUser: one(user, {
      fields: [crmSalesSequenceEnrollment.enrolledBy],
      references: [user.id],
    }),
    currentStep: one(crmSalesSequenceStep, {
      fields: [crmSalesSequenceEnrollment.currentStepId],
      references: [crmSalesSequenceStep.id],
    }),
    events: many(crmSalesSequenceEvent),
  }),
);

export const crmSalesSequenceEvent = pgTable("crm_sales_sequence_event", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),
  enrollmentId: text("enrollment_id")
    .notNull()
    .references(() => crmSalesSequenceEnrollment.id),
  stepId: text("step_id")
    .notNull()
    .references(() => crmSalesSequenceStep.id),
  eventType: text("event_type").notNull(),
  eventDate: timestamp("event_date").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

export const crmSalesSequenceEventRelations = relations(
  crmSalesSequenceEvent,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [crmSalesSequenceEvent.workspaceId],
      references: [workspace.id],
    }),
    enrollment: one(crmSalesSequenceEnrollment, {
      fields: [crmSalesSequenceEvent.enrollmentId],
      references: [crmSalesSequenceEnrollment.id],
    }),
    step: one(crmSalesSequenceStep, {
      fields: [crmSalesSequenceEvent.stepId],
      references: [crmSalesSequenceStep.id],
    }),
  }),
);

// ============================================================================
// PROJECT MANAGEMENT EXPANSION (20 tables)
// ============================================================================

export const projectSprint = pgTable("project_sprint", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  projectId: text("project_id").notNull().references(() => project.id),
  name: text("name").notNull(),
  goal: text("goal"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull(),
});

export const projectSprintRelations = relations(projectSprint, ({ one, many }) => ({
  workspace: one(workspace, { fields: [projectSprint.workspaceId], references: [workspace.id] }),
  project: one(project, { fields: [projectSprint.projectId], references: [project.id] }),
  tasks: many(projectTask),
}));

export const projectEpic = pgTable("project_epic", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  projectId: text("project_id").notNull().references(() => project.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull(),
  ownerId: text("owner_id").references(() => user.id),
});

export const projectEpicRelations = relations(projectEpic, ({ one, many }) => ({
  workspace: one(workspace, { fields: [projectEpic.workspaceId], references: [workspace.id] }),
  project: one(project, { fields: [projectEpic.projectId], references: [project.id] }),
  owner: one(user, { fields: [projectEpic.ownerId], references: [user.id] }),
  stories: many(projectStory),
}));

export const projectStory = pgTable("project_story", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  epicId: text("epic_id").references(() => projectEpic.id),
  title: text("title").notNull(),
  description: text("description"),
  storyPoints: integer("story_points"),
  priority: text("priority"),
  status: text("status").notNull(),
});

export const projectStoryRelations = relations(projectStory, ({ one }) => ({
  workspace: one(workspace, { fields: [projectStory.workspaceId], references: [workspace.id] }),
  epic: one(projectEpic, { fields: [projectStory.epicId], references: [projectEpic.id] }),
}));

export const projectBacklog = pgTable("project_backlog", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  projectId: text("project_id").notNull().references(() => project.id),
  title: text("title").notNull(),
  description: text("description"),
  priority: integer("priority").notNull(),
  estimatedEffort: integer("estimated_effort"),
});

export const projectBacklogRelations = relations(projectBacklog, ({ one }) => ({
  workspace: one(workspace, { fields: [projectBacklog.workspaceId], references: [workspace.id] }),
  project: one(project, { fields: [projectBacklog.projectId], references: [project.id] }),
}));

export const projectVelocityTracking = pgTable("project_velocity_tracking", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  sprintId: text("sprint_id").notNull().references(() => projectSprint.id),
  completedPoints: integer("completed_points").notNull(),
  committedPoints: integer("committed_points").notNull(),
  velocity: numeric("velocity", { precision: 10, scale: 2 }),
});

export const projectVelocityTrackingRelations = relations(projectVelocityTracking, ({ one }) => ({
  workspace: one(workspace, { fields: [projectVelocityTracking.workspaceId], references: [workspace.id] }),
  sprint: one(projectSprint, { fields: [projectVelocityTracking.sprintId], references: [projectSprint.id] }),
}));

export const projectBurndown = pgTable("project_burndown", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  sprintId: text("sprint_id").notNull().references(() => projectSprint.id),
  date: date("date").notNull(),
  remainingPoints: integer("remaining_points").notNull(),
  idealPoints: integer("ideal_points").notNull(),
});

export const projectBurndownRelations = relations(projectBurndown, ({ one }) => ({
  workspace: one(workspace, { fields: [projectBurndown.workspaceId], references: [workspace.id] }),
  sprint: one(projectSprint, { fields: [projectBurndown.sprintId], references: [projectSprint.id] }),
}));

export const projectResource = pgTable("project_resource", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  userId: text("user_id").notNull().references(() => user.id),
  skillSet: jsonb("skill_set").$type<string[]>(),
  availability: integer("availability").notNull(),
  costPerHour: numeric("cost_per_hour", { precision: 10, scale: 2 }),
});

export const projectResourceRelations = relations(projectResource, ({ one, many }) => ({
  workspace: one(workspace, { fields: [projectResource.workspaceId], references: [workspace.id] }),
  user: one(user, { fields: [projectResource.userId], references: [user.id] }),
  allocations: many(projectResourceAllocation),
}));

export const projectResourceAllocation = pgTable("project_resource_allocation", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  resourceId: text("resource_id").notNull().references(() => projectResource.id),
  projectId: text("project_id").notNull().references(() => project.id),
  allocationPercent: integer("allocation_percent").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
});

export const projectResourceAllocationRelations = relations(projectResourceAllocation, ({ one }) => ({
  workspace: one(workspace, { fields: [projectResourceAllocation.workspaceId], references: [workspace.id] }),
  resource: one(projectResource, { fields: [projectResourceAllocation.resourceId], references: [projectResource.id] }),
  project: one(project, { fields: [projectResourceAllocation.projectId], references: [project.id] }),
}));

export const projectResourceRequest = pgTable("project_resource_request", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  projectId: text("project_id").notNull().references(() => project.id),
  requestedBy: text("requested_by").references(() => user.id),
  skillsRequired: jsonb("skills_required").$type<string[]>(),
  quantity: integer("quantity").notNull(),
  priority: text("priority"),
  status: text("status").notNull(),
});

export const projectResourceRequestRelations = relations(projectResourceRequest, ({ one }) => ({
  workspace: one(workspace, { fields: [projectResourceRequest.workspaceId], references: [workspace.id] }),
  project: one(project, { fields: [projectResourceRequest.projectId], references: [project.id] }),
  requester: one(user, { fields: [projectResourceRequest.requestedBy], references: [user.id] }),
}));

export const projectCapacityPlanning = pgTable("project_capacity_planning", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  resourceId: text("resource_id").notNull().references(() => projectResource.id),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  plannedCapacity: integer("planned_capacity").notNull(),
  actualCapacity: integer("actual_capacity"),
});

export const projectCapacityPlanningRelations = relations(projectCapacityPlanning, ({ one }) => ({
  workspace: one(workspace, { fields: [projectCapacityPlanning.workspaceId], references: [workspace.id] }),
  resource: one(projectResource, { fields: [projectCapacityPlanning.resourceId], references: [projectResource.id] }),
}));

export const projectUtilizationReport = pgTable("project_utilization_report", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  resourceId: text("resource_id").notNull().references(() => projectResource.id),
  reportDate: date("report_date").notNull(),
  utilization: numeric("utilization", { precision: 5, scale: 2 }).notNull(),
  billableHours: numeric("billable_hours", { precision: 10, scale: 2 }),
  nonBillableHours: numeric("non_billable_hours", { precision: 10, scale: 2 }),
});

export const projectUtilizationReportRelations = relations(projectUtilizationReport, ({ one }) => ({
  workspace: one(workspace, { fields: [projectUtilizationReport.workspaceId], references: [workspace.id] }),
  resource: one(projectResource, { fields: [projectUtilizationReport.resourceId], references: [projectResource.id] }),
}));

export const projectRisk = pgTable("project_risk", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  projectId: text("project_id").notNull().references(() => project.id),
  riskTitle: text("risk_title").notNull(),
  description: text("description"),
  probability: text("probability"),
  impact: text("impact"),
  status: text("status").notNull(),
  ownerId: text("owner_id").references(() => user.id),
});

export const projectRiskRelations = relations(projectRisk, ({ one, many }) => ({
  workspace: one(workspace, { fields: [projectRisk.workspaceId], references: [workspace.id] }),
  project: one(project, { fields: [projectRisk.projectId], references: [project.id] }),
  owner: one(user, { fields: [projectRisk.ownerId], references: [user.id] }),
  mitigations: many(projectRiskMitigation),
}));

export const projectRiskMitigation = pgTable("project_risk_mitigation", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  riskId: text("risk_id").notNull().references(() => projectRisk.id),
  strategy: text("strategy").notNull(),
  action: text("action").notNull(),
  responsible: text("responsible").references(() => user.id),
  dueDate: timestamp("due_date"),
  status: text("status").notNull(),
});

export const projectRiskMitigationRelations = relations(projectRiskMitigation, ({ one }) => ({
  workspace: one(workspace, { fields: [projectRiskMitigation.workspaceId], references: [workspace.id] }),
  risk: one(projectRisk, { fields: [projectRiskMitigation.riskId], references: [projectRisk.id] }),
  responsibleUser: one(user, { fields: [projectRiskMitigation.responsible], references: [user.id] }),
}));

export const projectDependency = pgTable("project_dependency", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  predecessorTaskId: text("predecessor_task_id").notNull().references(() => projectTask.id),
  successorTaskId: text("successor_task_id").notNull().references(() => projectTask.id),
  dependencyType: text("dependency_type").notNull(),
  lag: integer("lag"),
});

export const projectDependencyRelations = relations(projectDependency, ({ one }) => ({
  workspace: one(workspace, { fields: [projectDependency.workspaceId], references: [workspace.id] }),
  predecessorTask: one(projectTask, { fields: [projectDependency.predecessorTaskId], references: [projectTask.id] }),
  successorTask: one(projectTask, { fields: [projectDependency.successorTaskId], references: [projectTask.id] }),
}));

export const projectMilestone = pgTable("project_milestone", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  projectId: text("project_id").notNull().references(() => project.id),
  name: text("name").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  completedDate: timestamp("completed_date"),
  status: text("status").notNull(),
});

export const projectMilestoneRelations = relations(projectMilestone, ({ one }) => ({
  workspace: one(workspace, { fields: [projectMilestone.workspaceId], references: [workspace.id] }),
  project: one(project, { fields: [projectMilestone.projectId], references: [project.id] }),
}));

export const projectGanttData = pgTable("project_gantt_data", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  taskId: text("task_id").notNull().references(() => projectTask.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  progress: integer("progress").notNull(),
  criticalPath: boolean("critical_path").notNull().default(false),
});

export const projectGanttDataRelations = relations(projectGanttData, ({ one }) => ({
  workspace: one(workspace, { fields: [projectGanttData.workspaceId], references: [workspace.id] }),
  task: one(projectTask, { fields: [projectGanttData.taskId], references: [projectTask.id] }),
}));

export const projectTimeEntry = pgTable("project_time_entry", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  taskId: text("task_id").references(() => projectTask.id),
  userId: text("user_id").notNull().references(() => user.id),
  hours: numeric("hours", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  description: text("description"),
  billable: boolean("billable").notNull().default(true),
});

export const projectTimeEntryRelations = relations(projectTimeEntry, ({ one }) => ({
  workspace: one(workspace, { fields: [projectTimeEntry.workspaceId], references: [workspace.id] }),
  task: one(projectTask, { fields: [projectTimeEntry.taskId], references: [projectTask.id] }),
  user: one(user, { fields: [projectTimeEntry.userId], references: [user.id] }),
}));

export const projectTimesheet = pgTable("project_timesheet", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  userId: text("user_id").notNull().references(() => user.id),
  weekStarting: date("week_starting").notNull(),
  totalHours: numeric("total_hours", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(),
  submittedAt: timestamp("submitted_at"),
});

export const projectTimesheetRelations = relations(projectTimesheet, ({ one, many }) => ({
  workspace: one(workspace, { fields: [projectTimesheet.workspaceId], references: [workspace.id] }),
  user: one(user, { fields: [projectTimesheet.userId], references: [user.id] }),
  approvals: many(projectTimesheetApproval),
}));

export const projectTimesheetApproval = pgTable("project_timesheet_approval", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  timesheetId: text("timesheet_id").notNull().references(() => projectTimesheet.id),
  approverId: text("approver_id").notNull().references(() => user.id),
  approvalStatus: text("approval_status").notNull(),
  approvedAt: timestamp("approved_at"),
  comments: text("comments"),
});

export const projectTimesheetApprovalRelations = relations(projectTimesheetApproval, ({ one }) => ({
  workspace: one(workspace, { fields: [projectTimesheetApproval.workspaceId], references: [workspace.id] }),
  timesheet: one(projectTimesheet, { fields: [projectTimesheetApproval.timesheetId], references: [projectTimesheet.id] }),
  approver: one(user, { fields: [projectTimesheetApproval.approverId], references: [user.id] }),
}));

export const projectBillableRate = pgTable("project_billable_rate", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  projectId: text("project_id").references(() => project.id),
  userId: text("user_id").references(() => user.id),
  role: text("role"),
  rate: numeric("rate", { precision: 10, scale: 2 }).notNull(),
  effectiveDate: date("effective_date").notNull(),
});

export const projectBillableRateRelations = relations(projectBillableRate, ({ one }) => ({
  workspace: one(workspace, { fields: [projectBillableRate.workspaceId], references: [workspace.id] }),
  project: one(project, { fields: [projectBillableRate.projectId], references: [project.id] }),
  user: one(user, { fields: [projectBillableRate.userId], references: [user.id] }),
}));

// ============================================================================
// HR & EMPLOYEE MANAGEMENT (20 tables)
// ============================================================================

export const hrEmployee = pgTable("hr_employee", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  userId: text("user_id").references(() => user.id),
  employeeNumber: text("employee_number").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").$type<`${string}@${string}`>().notNull(),
  phone: text("phone"),
  hireDate: date("hire_date").notNull(),
  departmentId: text("department_id").references(() => hrDepartment.id),
  managerId: text("manager_id").references(() => hrEmployee.id),
  status: text("status").notNull(),
});

export const hrEmployeeRelations = relations(hrEmployee, ({ one, many }) => ({
  workspace: one(workspace, { fields: [hrEmployee.workspaceId], references: [workspace.id] }),
  user: one(user, { fields: [hrEmployee.userId], references: [user.id] }),
  department: one(hrDepartment, { fields: [hrEmployee.departmentId], references: [hrDepartment.id] }),
  manager: one(hrEmployee, { fields: [hrEmployee.managerId], references: [hrEmployee.id] }),
  positions: many(hrEmployeePosition),
  timeOffRequests: many(hrTimeOffRequest),
  reviews: many(hrPerformanceReview),
  salaryHistory: many(hrSalaryHistory),
}));

export const hrDepartment = pgTable("hr_department", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  description: text("description"),
  headId: text("head_id").references(() => hrEmployee.id),
});

export const hrDepartmentRelations = relations(hrDepartment, ({ one, many }) => ({
  workspace: one(workspace, { fields: [hrDepartment.workspaceId], references: [workspace.id] }),
  head: one(hrEmployee, { fields: [hrDepartment.headId], references: [hrEmployee.id] }),
  employees: many(hrEmployee),
  teams: many(hrTeam),
}));

export const hrTeam = pgTable("hr_team", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  departmentId: text("department_id").references(() => hrDepartment.id),
  name: text("name").notNull(),
  description: text("description"),
  leadId: text("lead_id").references(() => hrEmployee.id),
});

export const hrTeamRelations = relations(hrTeam, ({ one }) => ({
  workspace: one(workspace, { fields: [hrTeam.workspaceId], references: [workspace.id] }),
  department: one(hrDepartment, { fields: [hrTeam.departmentId], references: [hrDepartment.id] }),
  lead: one(hrEmployee, { fields: [hrTeam.leadId], references: [hrEmployee.id] }),
}));

export const hrPosition = pgTable("hr_position", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  title: text("title").notNull(),
  level: text("level"),
  departmentId: text("department_id").references(() => hrDepartment.id),
  description: text("description"),
});

export const hrPositionRelations = relations(hrPosition, ({ one, many }) => ({
  workspace: one(workspace, { fields: [hrPosition.workspaceId], references: [workspace.id] }),
  department: one(hrDepartment, { fields: [hrPosition.departmentId], references: [hrDepartment.id] }),
  employeePositions: many(hrEmployeePosition),
}));

export const hrEmployeePosition = pgTable("hr_employee_position", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  employeeId: text("employee_id").notNull().references(() => hrEmployee.id),
  positionId: text("position_id").notNull().references(() => hrPosition.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isCurrent: boolean("is_current").notNull().default(true),
});

export const hrEmployeePositionRelations = relations(hrEmployeePosition, ({ one }) => ({
  workspace: one(workspace, { fields: [hrEmployeePosition.workspaceId], references: [workspace.id] }),
  employee: one(hrEmployee, { fields: [hrEmployeePosition.employeeId], references: [hrEmployee.id] }),
  position: one(hrPosition, { fields: [hrEmployeePosition.positionId], references: [hrPosition.id] }),
}));

export const hrOrganizationChart = pgTable("hr_organization_chart", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  employeeId: text("employee_id").notNull().references(() => hrEmployee.id),
  parentEmployeeId: text("parent_employee_id").references(() => hrEmployee.id),
  level: integer("level").notNull(),
  path: text("path").notNull(),
});

export const hrOrganizationChartRelations = relations(hrOrganizationChart, ({ one }) => ({
  workspace: one(workspace, { fields: [hrOrganizationChart.workspaceId], references: [workspace.id] }),
  employee: one(hrEmployee, { fields: [hrOrganizationChart.employeeId], references: [hrEmployee.id] }),
  parentEmployee: one(hrEmployee, { fields: [hrOrganizationChart.parentEmployeeId], references: [hrEmployee.id] }),
}));

export const hrTimeOffPolicy = pgTable("hr_time_off_policy", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  policyType: text("policy_type").notNull(),
  daysPerYear: integer("days_per_year").notNull(),
  carryoverDays: integer("carryover_days"),
  description: text("description"),
});

export const hrTimeOffPolicyRelations = relations(hrTimeOffPolicy, ({ one, many }) => ({
  workspace: one(workspace, { fields: [hrTimeOffPolicy.workspaceId], references: [workspace.id] }),
  requests: many(hrTimeOffRequest),
  balances: many(hrTimeOffBalance),
}));

export const hrTimeOffRequest = pgTable("hr_time_off_request", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  employeeId: text("employee_id").notNull().references(() => hrEmployee.id),
  policyId: text("policy_id").notNull().references(() => hrTimeOffPolicy.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  days: numeric("days", { precision: 5, scale: 2 }).notNull(),
  reason: text("reason"),
  status: text("status").notNull(),
  approverId: text("approver_id").references(() => hrEmployee.id),
  approvedAt: timestamp("approved_at"),
});

export const hrTimeOffRequestRelations = relations(hrTimeOffRequest, ({ one }) => ({
  workspace: one(workspace, { fields: [hrTimeOffRequest.workspaceId], references: [workspace.id] }),
  employee: one(hrEmployee, { fields: [hrTimeOffRequest.employeeId], references: [hrEmployee.id] }),
  policy: one(hrTimeOffPolicy, { fields: [hrTimeOffRequest.policyId], references: [hrTimeOffPolicy.id] }),
  approver: one(hrEmployee, { fields: [hrTimeOffRequest.approverId], references: [hrEmployee.id] }),
}));

export const hrTimeOffBalance = pgTable("hr_time_off_balance", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  employeeId: text("employee_id").notNull().references(() => hrEmployee.id),
  policyId: text("policy_id").notNull().references(() => hrTimeOffPolicy.id),
  year: integer("year").notNull(),
  totalDays: numeric("total_days", { precision: 5, scale: 2 }).notNull(),
  usedDays: numeric("used_days", { precision: 5, scale: 2 }).notNull(),
  remainingDays: numeric("remaining_days", { precision: 5, scale: 2 }).notNull(),
});

export const hrTimeOffBalanceRelations = relations(hrTimeOffBalance, ({ one }) => ({
  workspace: one(workspace, { fields: [hrTimeOffBalance.workspaceId], references: [workspace.id] }),
  employee: one(hrEmployee, { fields: [hrTimeOffBalance.employeeId], references: [hrEmployee.id] }),
  policy: one(hrTimeOffPolicy, { fields: [hrTimeOffBalance.policyId], references: [hrTimeOffPolicy.id] }),
}));

export const hrAttendance = pgTable("hr_attendance", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  employeeId: text("employee_id").notNull().references(() => hrEmployee.id),
  date: date("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  totalHours: numeric("total_hours", { precision: 5, scale: 2 }),
  status: text("status").notNull(),
});

export const hrAttendanceRelations = relations(hrAttendance, ({ one, many }) => ({
  workspace: one(workspace, { fields: [hrAttendance.workspaceId], references: [workspace.id] }),
  employee: one(hrEmployee, { fields: [hrAttendance.employeeId], references: [hrEmployee.id] }),
  exceptions: many(hrAttendanceException),
}));

export const hrAttendanceException = pgTable("hr_attendance_exception", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  attendanceId: text("attendance_id").notNull().references(() => hrAttendance.id),
  exceptionType: text("exception_type").notNull(),
  reason: text("reason"),
  resolvedBy: text("resolved_by").references(() => hrEmployee.id),
  resolvedAt: timestamp("resolved_at"),
});

export const hrAttendanceExceptionRelations = relations(hrAttendanceException, ({ one }) => ({
  workspace: one(workspace, { fields: [hrAttendanceException.workspaceId], references: [workspace.id] }),
  attendance: one(hrAttendance, { fields: [hrAttendanceException.attendanceId], references: [hrAttendance.id] }),
  resolver: one(hrEmployee, { fields: [hrAttendanceException.resolvedBy], references: [hrEmployee.id] }),
}));

export const hrPerformanceReview = pgTable("hr_performance_review", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  employeeId: text("employee_id").notNull().references(() => hrEmployee.id),
  reviewerId: text("reviewer_id").notNull().references(() => hrEmployee.id),
  cycleId: text("cycle_id").references(() => hrPerformanceReviewCycle.id),
  reviewDate: date("review_date").notNull(),
  overallRating: integer("overall_rating"),
  comments: text("comments"),
  status: text("status").notNull(),
});

export const hrPerformanceReviewRelations = relations(hrPerformanceReview, ({ one, many }) => ({
  workspace: one(workspace, { fields: [hrPerformanceReview.workspaceId], references: [workspace.id] }),
  employee: one(hrEmployee, { fields: [hrPerformanceReview.employeeId], references: [hrEmployee.id] }),
  reviewer: one(hrEmployee, { fields: [hrPerformanceReview.reviewerId], references: [hrEmployee.id] }),
  cycle: one(hrPerformanceReviewCycle, { fields: [hrPerformanceReview.cycleId], references: [hrPerformanceReviewCycle.id] }),
  goals: many(hrPerformanceGoal),
  feedback: many(hrPerformanceFeedback),
}));

export const hrPerformanceGoal = pgTable("hr_performance_goal", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  reviewId: text("review_id").references(() => hrPerformanceReview.id),
  employeeId: text("employee_id").notNull().references(() => hrEmployee.id),
  title: text("title").notNull(),
  description: text("description"),
  targetDate: date("target_date"),
  status: text("status").notNull(),
  progress: integer("progress"),
});

export const hrPerformanceGoalRelations = relations(hrPerformanceGoal, ({ one }) => ({
  workspace: one(workspace, { fields: [hrPerformanceGoal.workspaceId], references: [workspace.id] }),
  review: one(hrPerformanceReview, { fields: [hrPerformanceGoal.reviewId], references: [hrPerformanceReview.id] }),
  employee: one(hrEmployee, { fields: [hrPerformanceGoal.employeeId], references: [hrEmployee.id] }),
}));

export const hrPerformanceReviewCycle = pgTable("hr_performance_review_cycle", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: text("status").notNull(),
});

export const hrPerformanceReviewCycleRelations = relations(hrPerformanceReviewCycle, ({ one, many }) => ({
  workspace: one(workspace, { fields: [hrPerformanceReviewCycle.workspaceId], references: [workspace.id] }),
  reviews: many(hrPerformanceReview),
}));

export const hrPerformanceFeedback = pgTable("hr_performance_feedback", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  reviewId: text("review_id").notNull().references(() => hrPerformanceReview.id),
  givenBy: text("given_by").notNull().references(() => hrEmployee.id),
  feedbackType: text("feedback_type").notNull(),
  content: text("content").notNull(),
  rating: integer("rating"),
});

export const hrPerformanceFeedbackRelations = relations(hrPerformanceFeedback, ({ one }) => ({
  workspace: one(workspace, { fields: [hrPerformanceFeedback.workspaceId], references: [workspace.id] }),
  review: one(hrPerformanceReview, { fields: [hrPerformanceFeedback.reviewId], references: [hrPerformanceReview.id] }),
  giver: one(hrEmployee, { fields: [hrPerformanceFeedback.givenBy], references: [hrEmployee.id] }),
}));

export const hrPerformanceImprovement = pgTable("hr_performance_improvement", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  employeeId: text("employee_id").notNull().references(() => hrEmployee.id),
  reviewId: text("review_id").references(() => hrPerformanceReview.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  reason: text("reason").notNull(),
  objectives: text("objectives").notNull(),
  status: text("status").notNull(),
  outcome: text("outcome"),
});

export const hrPerformanceImprovementRelations = relations(hrPerformanceImprovement, ({ one }) => ({
  workspace: one(workspace, { fields: [hrPerformanceImprovement.workspaceId], references: [workspace.id] }),
  employee: one(hrEmployee, { fields: [hrPerformanceImprovement.employeeId], references: [hrEmployee.id] }),
  review: one(hrPerformanceReview, { fields: [hrPerformanceImprovement.reviewId], references: [hrPerformanceReview.id] }),
}));

export const hrSalaryHistory = pgTable("hr_salary_history", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  employeeId: text("employee_id").notNull().references(() => hrEmployee.id),
  effectiveDate: date("effective_date").notNull(),
  salary: numeric("salary", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  changeReason: text("change_reason"),
  approvedBy: text("approved_by").references(() => hrEmployee.id),
});

export const hrSalaryHistoryRelations = relations(hrSalaryHistory, ({ one }) => ({
  workspace: one(workspace, { fields: [hrSalaryHistory.workspaceId], references: [workspace.id] }),
  employee: one(hrEmployee, { fields: [hrSalaryHistory.employeeId], references: [hrEmployee.id] }),
  approver: one(hrEmployee, { fields: [hrSalaryHistory.approvedBy], references: [hrEmployee.id] }),
}));

export const hrBonus = pgTable("hr_bonus", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  employeeId: text("employee_id").notNull().references(() => hrEmployee.id),
  bonusType: text("bonus_type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  bonusDate: date("bonus_date").notNull(),
  reason: text("reason"),
});

export const hrBonusRelations = relations(hrBonus, ({ one }) => ({
  workspace: one(workspace, { fields: [hrBonus.workspaceId], references: [workspace.id] }),
  employee: one(hrEmployee, { fields: [hrBonus.employeeId], references: [hrEmployee.id] }),
}));

export const hrBenefit = pgTable("hr_benefit", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  benefitType: text("benefit_type").notNull(),
  description: text("description"),
  provider: text("provider"),
  cost: numeric("cost", { precision: 10, scale: 2 }),
});

export const hrBenefitRelations = relations(hrBenefit, ({ one, many }) => ({
  workspace: one(workspace, { fields: [hrBenefit.workspaceId], references: [workspace.id] }),
  employeeBenefits: many(hrEmployeeBenefit),
}));

export const hrEmployeeBenefit = pgTable("hr_employee_benefit", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  employeeId: text("employee_id").notNull().references(() => hrEmployee.id),
  benefitId: text("benefit_id").notNull().references(() => hrBenefit.id),
  enrollmentDate: date("enrollment_date").notNull(),
  endDate: date("end_date"),
  status: text("status").notNull(),
});

export const hrEmployeeBenefitRelations = relations(hrEmployeeBenefit, ({ one }) => ({
  workspace: one(workspace, { fields: [hrEmployeeBenefit.workspaceId], references: [workspace.id] }),
  employee: one(hrEmployee, { fields: [hrEmployeeBenefit.employeeId], references: [hrEmployee.id] }),
  benefit: one(hrBenefit, { fields: [hrEmployeeBenefit.benefitId], references: [hrBenefit.id] }),
}));

// ============================================================================
// FINANCE & ACCOUNTING (18 tables)
// ============================================================================

export const apVendor = pgTable("ap_vendor", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email").$type<`${string}@${string}`>(),
  phone: text("phone"),
  address: text("address"),
  paymentTerms: text("payment_terms"),
  taxId: text("tax_id"),
});

export const apVendorRelations = relations(apVendor, ({ one, many }) => ({
  workspace: one(workspace, { fields: [apVendor.workspaceId], references: [workspace.id] }),
  invoices: many(apInvoice),
}));

export const apInvoice = pgTable("ap_invoice", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  vendorId: text("vendor_id").notNull().references(() => apVendor.id),
  invoiceNumber: text("invoice_number").notNull().unique(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }),
  status: text("status").notNull(),
});

export const apInvoiceRelations = relations(apInvoice, ({ one, many }) => ({
  workspace: one(workspace, { fields: [apInvoice.workspaceId], references: [workspace.id] }),
  vendor: one(apVendor, { fields: [apInvoice.vendorId], references: [apVendor.id] }),
  lineItems: many(apInvoiceLineItem),
  payments: many(apPayment),
}));

export const apInvoiceLineItem = pgTable("ap_invoice_line_item", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  invoiceId: text("invoice_id").notNull().references(() => apInvoice.id),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
  accountCode: text("account_code"),
});

export const apInvoiceLineItemRelations = relations(apInvoiceLineItem, ({ one }) => ({
  workspace: one(workspace, { fields: [apInvoiceLineItem.workspaceId], references: [workspace.id] }),
  invoice: one(apInvoice, { fields: [apInvoiceLineItem.invoiceId], references: [apInvoice.id] }),
}));

export const apPayment = pgTable("ap_payment", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  invoiceId: text("invoice_id").notNull().references(() => apInvoice.id),
  paymentDate: date("payment_date").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethodId: text("payment_method_id").references(() => apPaymentMethod.id),
  referenceNumber: text("reference_number"),
});

export const apPaymentRelations = relations(apPayment, ({ one }) => ({
  workspace: one(workspace, { fields: [apPayment.workspaceId], references: [workspace.id] }),
  invoice: one(apInvoice, { fields: [apPayment.invoiceId], references: [apInvoice.id] }),
  paymentMethod: one(apPaymentMethod, { fields: [apPayment.paymentMethodId], references: [apPaymentMethod.id] }),
}));

export const apPaymentMethod = pgTable("ap_payment_method", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  methodType: text("method_type").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
});

export const apPaymentMethodRelations = relations(apPaymentMethod, ({ one, many }) => ({
  workspace: one(workspace, { fields: [apPaymentMethod.workspaceId], references: [workspace.id] }),
  payments: many(apPayment),
}));

export const arCustomer = pgTable("ar_customer", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email").$type<`${string}@${string}`>(),
  phone: text("phone"),
  billingAddress: text("billing_address"),
  shippingAddress: text("shipping_address"),
  paymentTermsId: text("payment_terms_id").references(() => arPaymentTerm.id),
});

export const arCustomerRelations = relations(arCustomer, ({ one, many }) => ({
  workspace: one(workspace, { fields: [arCustomer.workspaceId], references: [workspace.id] }),
  paymentTerms: one(arPaymentTerm, { fields: [arCustomer.paymentTermsId], references: [arPaymentTerm.id] }),
  invoices: many(arInvoice),
}));

export const arInvoice = pgTable("ar_invoice", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  customerId: text("customer_id").notNull().references(() => arCustomer.id),
  invoiceNumber: text("invoice_number").notNull().unique(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }),
  status: text("status").notNull(),
});

export const arInvoiceRelations = relations(arInvoice, ({ one, many }) => ({
  workspace: one(workspace, { fields: [arInvoice.workspaceId], references: [workspace.id] }),
  customer: one(arCustomer, { fields: [arInvoice.customerId], references: [arCustomer.id] }),
  lineItems: many(arInvoiceLineItem),
  payments: many(arPaymentReceived),
}));

export const arInvoiceLineItem = pgTable("ar_invoice_line_item", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  invoiceId: text("invoice_id").notNull().references(() => arInvoice.id),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }),
});

export const arInvoiceLineItemRelations = relations(arInvoiceLineItem, ({ one }) => ({
  workspace: one(workspace, { fields: [arInvoiceLineItem.workspaceId], references: [workspace.id] }),
  invoice: one(arInvoice, { fields: [arInvoiceLineItem.invoiceId], references: [arInvoice.id] }),
}));

export const arPaymentReceived = pgTable("ar_payment_received", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  invoiceId: text("invoice_id").notNull().references(() => arInvoice.id),
  paymentDate: date("payment_date").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"),
  referenceNumber: text("reference_number"),
});

export const arPaymentReceivedRelations = relations(arPaymentReceived, ({ one }) => ({
  workspace: one(workspace, { fields: [arPaymentReceived.workspaceId], references: [workspace.id] }),
  invoice: one(arInvoice, { fields: [arPaymentReceived.invoiceId], references: [arInvoice.id] }),
}));

export const arPaymentTerm = pgTable("ar_payment_term", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  dueDays: integer("due_days").notNull(),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }),
  discountDays: integer("discount_days"),
});

export const arPaymentTermRelations = relations(arPaymentTerm, ({ one, many }) => ({
  workspace: one(workspace, { fields: [arPaymentTerm.workspaceId], references: [workspace.id] }),
  customers: many(arCustomer),
}));

export const taxRate = pgTable("tax_rate", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  rate: numeric("rate", { precision: 5, scale: 4 }).notNull(),
  jurisdictionId: text("jurisdiction_id").references(() => taxJurisdiction.id),
  taxType: text("tax_type").notNull(),
  effectiveDate: date("effective_date").notNull(),
});

export const taxRateRelations = relations(taxRate, ({ one }) => ({
  workspace: one(workspace, { fields: [taxRate.workspaceId], references: [workspace.id] }),
  jurisdiction: one(taxJurisdiction, { fields: [taxRate.jurisdictionId], references: [taxJurisdiction.id] }),
}));

export const taxJurisdiction = pgTable("tax_jurisdiction", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  jurisdictionType: text("jurisdiction_type").notNull(),
  code: text("code"),
});

export const taxJurisdictionRelations = relations(taxJurisdiction, ({ one, many }) => ({
  workspace: one(workspace, { fields: [taxJurisdiction.workspaceId], references: [workspace.id] }),
  taxRates: many(taxRate),
}));

export const taxReturn = pgTable("tax_return", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  taxYear: integer("tax_year").notNull(),
  returnType: text("return_type").notNull(),
  filingDate: date("filing_date"),
  dueDate: date("due_date").notNull(),
  totalTax: numeric("total_tax", { precision: 12, scale: 2 }),
  status: text("status").notNull(),
});

export const taxReturnRelations = relations(taxReturn, ({ one, many }) => ({
  workspace: one(workspace, { fields: [taxReturn.workspaceId], references: [workspace.id] }),
  lineItems: many(taxLineItem),
}));

export const taxLineItem = pgTable("tax_line_item", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  returnId: text("return_id").notNull().references(() => taxReturn.id),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category"),
});

export const taxLineItemRelations = relations(taxLineItem, ({ one }) => ({
  workspace: one(workspace, { fields: [taxLineItem.workspaceId], references: [workspace.id] }),
  taxReturn: one(taxReturn, { fields: [taxLineItem.returnId], references: [taxReturn.id] }),
}));

export const bankAccount = pgTable("bank_account", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  bankName: text("bank_name").notNull(),
  accountType: text("account_type").notNull(),
  currency: text("currency").notNull(),
  balance: numeric("balance", { precision: 12, scale: 2 }),
});

export const bankAccountRelations = relations(bankAccount, ({ one, many }) => ({
  workspace: one(workspace, { fields: [bankAccount.workspaceId], references: [workspace.id] }),
  transactions: many(bankTransaction),
  reconciliations: many(bankReconciliation),
}));

export const bankTransaction = pgTable("bank_transaction", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  accountId: text("account_id").notNull().references(() => bankAccount.id),
  transactionDate: date("transaction_date").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  transactionType: text("transaction_type").notNull(),
  category: text("category"),
  reconciled: boolean("reconciled").notNull().default(false),
});

export const bankTransactionRelations = relations(bankTransaction, ({ one }) => ({
  workspace: one(workspace, { fields: [bankTransaction.workspaceId], references: [workspace.id] }),
  account: one(bankAccount, { fields: [bankTransaction.accountId], references: [bankAccount.id] }),
}));

export const bankReconciliation = pgTable("bank_reconciliation", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  accountId: text("account_id").notNull().references(() => bankAccount.id),
  statementDate: date("statement_date").notNull(),
  statementBalance: numeric("statement_balance", { precision: 12, scale: 2 }).notNull(),
  bookBalance: numeric("book_balance", { precision: 12, scale: 2 }).notNull(),
  difference: numeric("difference", { precision: 12, scale: 2 }),
  status: text("status").notNull(),
  reconciledBy: text("reconciled_by").references(() => user.id),
});

export const bankReconciliationRelations = relations(bankReconciliation, ({ one, many }) => ({
  workspace: one(workspace, { fields: [bankReconciliation.workspaceId], references: [workspace.id] }),
  account: one(bankAccount, { fields: [bankReconciliation.accountId], references: [bankAccount.id] }),
  reconciledByUser: one(user, { fields: [bankReconciliation.reconciledBy], references: [user.id] }),
  items: many(bankReconciliationItem),
}));

export const bankReconciliationItem = pgTable("bank_reconciliation_item", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  reconciliationId: text("reconciliation_id").notNull().references(() => bankReconciliation.id),
  transactionId: text("transaction_id").references(() => bankTransaction.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  itemType: text("item_type").notNull(),
  description: text("description"),
});

export const bankReconciliationItemRelations = relations(bankReconciliationItem, ({ one }) => ({
  workspace: one(workspace, { fields: [bankReconciliationItem.workspaceId], references: [workspace.id] }),
  reconciliation: one(bankReconciliation, { fields: [bankReconciliationItem.reconciliationId], references: [bankReconciliation.id] }),
  transaction: one(bankTransaction, { fields: [bankReconciliationItem.transactionId], references: [bankTransaction.id] }),
}));

// ============================================================================
// PRODUCT & INVENTORY (15 tables)
// ============================================================================

export const productCatalog = pgTable("product_catalog", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
});

export const productCatalogRelations = relations(productCatalog, ({ one, many }) => ({
  workspace: one(workspace, { fields: [productCatalog.workspaceId], references: [workspace.id] }),
  categories: many(productCategory),
}));

export const productCategory = pgTable("product_category", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  catalogId: text("catalog_id").references(() => productCatalog.id),
  name: text("name").notNull(),
  description: text("description"),
  parentId: text("parent_id"),
});

export const productCategoryRelations = relations(productCategory, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [productCategory.workspaceId],
    references: [workspace.id],
  }),
  workspace: one(workspace, { fields: [productCategory.workspaceId], references: [workspace.id] }),
  catalog: one(productCatalog, { fields: [productCategory.catalogId], references: [productCatalog.id] }),
  products: many(product),
  parent: one(productCategory, { fields: [productCategory.parentId], references: [productCategory.id] }),
  children: many(productCategory),
}));

export const product = pgTable("product", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  categoryId: text("category_id").references(() => productCategory.id),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku").notNull().unique(),
  barcode: text("barcode"),
  isActive: boolean("is_active").notNull().default(true),
});

export const productRelations = relations(product, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [product.workspaceId],
    references: [workspace.id],
  }),
  workspace: one(workspace, { fields: [product.workspaceId], references: [workspace.id] }),
  category: one(productCategory, { fields: [product.categoryId], references: [productCategory.id] }),
  variants: many(productVariant),
  prices: many(productPrice),
  inventoryItems: many(inventoryItem),
}));

export const productVariant = pgTable("product_variant", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  productId: text("product_id").notNull().references(() => product.id),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  attributes: jsonb("attributes").$type<Record<string, string>>(),
});

export const productVariantRelations = relations(productVariant, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [productVariant.workspaceId],
    references: [workspace.id],
  }),
  workspace: one(workspace, { fields: [productVariant.workspaceId], references: [workspace.id] }),
  product: one(product, { fields: [productVariant.productId], references: [product.id] }),
  prices: many(productPrice),
}));

export const productPrice = pgTable("product_price", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  productId: text("product_id").references(() => product.id),
  variantId: text("variant_id").references(() => productVariant.id),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  priceType: text("price_type").notNull(),
  effectiveDate: date("effective_date").notNull(),
  expiryDate: date("expiry_date"),
});

export const productPriceRelations = relations(productPrice, ({ one }) => ({
  workspace: one(workspace, { fields: [productPrice.workspaceId], references: [workspace.id] }),
  product: one(product, { fields: [productPrice.productId], references: [product.id] }),
  variant: one(productVariant, { fields: [productPrice.variantId], references: [productVariant.id] }),
}));

export const inventoryLocation = pgTable("inventory_location", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  locationType: text("location_type").notNull(),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
});

export const inventoryLocationRelations = relations(inventoryLocation, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [inventoryLocation.workspaceId],
    references: [workspace.id],
  }),
  workspace: one(workspace, { fields: [inventoryLocation.workspaceId], references: [workspace.id] }),
  inventoryItems: many(inventoryItem),
}));

export const inventoryItem = pgTable("inventory_item", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  productId: text("product_id").notNull().references(() => product.id),
  locationId: text("location_id").notNull().references(() => inventoryLocation.id),
  quantityOnHand: integer("quantity_on_hand").notNull(),
  quantityReserved: integer("quantity_reserved").notNull(),
  quantityAvailable: integer("quantity_available").notNull(),
  reorderPoint: integer("reorder_point"),
  reorderQuantity: integer("reorder_quantity"),
});

export const inventoryItemRelations = relations(inventoryItem, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [inventoryItem.workspaceId],
    references: [workspace.id],
  }),
  workspace: one(workspace, { fields: [inventoryItem.workspaceId], references: [workspace.id] }),
  product: one(product, { fields: [inventoryItem.productId], references: [product.id] }),
  location: one(inventoryLocation, { fields: [inventoryItem.locationId], references: [inventoryLocation.id] }),
  transactions: many(inventoryTransaction),
}));

export const inventoryTransaction = pgTable("inventory_transaction", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  inventoryItemId: text("inventory_item_id").notNull().references(() => inventoryItem.id),
  transactionType: text("transaction_type").notNull(),
  quantity: integer("quantity").notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  referenceType: text("reference_type"),
  referenceId: text("reference_id"),
  notes: text("notes"),
});

export const inventoryTransactionRelations = relations(inventoryTransaction, ({ one }) => ({
  workspace: one(workspace, { fields: [inventoryTransaction.workspaceId], references: [workspace.id] }),
  inventoryItem: one(inventoryItem, { fields: [inventoryTransaction.inventoryItemId], references: [inventoryItem.id] }),
}));

export const inventoryAdjustment = pgTable("inventory_adjustment", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  inventoryItemId: text("inventory_item_id").notNull().references(() => inventoryItem.id),
  adjustmentDate: date("adjustment_date").notNull(),
  quantityBefore: integer("quantity_before").notNull(),
  quantityAfter: integer("quantity_after").notNull(),
  adjustmentQuantity: integer("adjustment_quantity").notNull(),
  reason: text("reason").notNull(),
  approvedBy: text("approved_by").references(() => user.id),
});

export const inventoryAdjustmentRelations = relations(inventoryAdjustment, ({ one }) => ({
  workspace: one(workspace, { fields: [inventoryAdjustment.workspaceId], references: [workspace.id] }),
  inventoryItem: one(inventoryItem, { fields: [inventoryAdjustment.inventoryItemId], references: [inventoryItem.id] }),
  approver: one(user, { fields: [inventoryAdjustment.approvedBy], references: [user.id] }),
}));

export const inventoryCount = pgTable("inventory_count", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  locationId: text("location_id").notNull().references(() => inventoryLocation.id),
  countDate: date("count_date").notNull(),
  countedBy: text("counted_by").references(() => user.id),
  status: text("status").notNull(),
  notes: text("notes"),
});

export const inventoryCountRelations = relations(inventoryCount, ({ one }) => ({
  workspace: one(workspace, { fields: [inventoryCount.workspaceId], references: [workspace.id] }),
  location: one(inventoryLocation, { fields: [inventoryCount.locationId], references: [inventoryLocation.id] }),
  counter: one(user, { fields: [inventoryCount.countedBy], references: [user.id] }),
}));

export const supplier = pgTable("supplier", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email").$type<`${string}@${string}`>(),
  phone: text("phone"),
  address: text("address"),
  rating: integer("rating"),
});

export const supplierRelations = relations(supplier, ({ one, many }) => ({
  workspace: one(workspace, { fields: [supplier.workspaceId], references: [workspace.id] }),
  supplierProducts: many(supplierProduct),
  purchaseOrders: many(purchaseOrder),
}));

export const supplierProduct = pgTable("supplier_product", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  supplierId: text("supplier_id").notNull().references(() => supplier.id),
  productId: text("product_id").notNull().references(() => product.id),
  supplierSku: text("supplier_sku"),
  cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),
  leadTimeDays: integer("lead_time_days"),
  minimumOrderQuantity: integer("minimum_order_quantity"),
});

export const supplierProductRelations = relations(supplierProduct, ({ one }) => ({
  workspace: one(workspace, { fields: [supplierProduct.workspaceId], references: [workspace.id] }),
  supplier: one(supplier, { fields: [supplierProduct.supplierId], references: [supplier.id] }),
  product: one(product, { fields: [supplierProduct.productId], references: [product.id] }),
}));

export const purchaseOrder = pgTable("purchase_order", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  supplierId: text("supplier_id").notNull().references(() => supplier.id),
  orderNumber: text("order_number").notNull().unique(),
  orderDate: date("order_date").notNull(),
  expectedDate: date("expected_date"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull(),
  approvedBy: text("approved_by").references(() => user.id),
});

export const purchaseOrderRelations = relations(purchaseOrder, ({ one, many }) => ({
  workspace: one(workspace, { fields: [purchaseOrder.workspaceId], references: [workspace.id] }),
  supplier: one(supplier, { fields: [purchaseOrder.supplierId], references: [supplier.id] }),
  approver: one(user, { fields: [purchaseOrder.approvedBy], references: [user.id] }),
  lineItems: many(purchaseOrderLine),
  receivingNotes: many(receivingNote),
}));

export const purchaseOrderLine = pgTable("purchase_order_line", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  purchaseOrderId: text("purchase_order_id").notNull().references(() => purchaseOrder.id),
  productId: text("product_id").notNull().references(() => product.id),
  quantity: integer("quantity").notNull(),
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).notNull(),
  totalCost: numeric("total_cost", { precision: 12, scale: 2 }).notNull(),
  receivedQuantity: integer("received_quantity").notNull().default(0),
});

export const purchaseOrderLineRelations = relations(purchaseOrderLine, ({ one }) => ({
  workspace: one(workspace, { fields: [purchaseOrderLine.workspaceId], references: [workspace.id] }),
  purchaseOrder: one(purchaseOrder, { fields: [purchaseOrderLine.purchaseOrderId], references: [purchaseOrder.id] }),
  product: one(product, { fields: [purchaseOrderLine.productId], references: [product.id] }),
}));

export const receivingNote = pgTable("receiving_note", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  purchaseOrderId: text("purchase_order_id").notNull().references(() => purchaseOrder.id),
  receivedDate: date("received_date").notNull(),
  receivedBy: text("received_by").references(() => user.id),
  notes: text("notes"),
});

export const receivingNoteRelations = relations(receivingNote, ({ one }) => ({
  workspace: one(workspace, { fields: [receivingNote.workspaceId], references: [workspace.id] }),
  purchaseOrder: one(purchaseOrder, { fields: [receivingNote.purchaseOrderId], references: [purchaseOrder.id] }),
  receiver: one(user, { fields: [receivingNote.receivedBy], references: [user.id] }),
}));

// ============================================================================
// KNOWLEDGE BASE & SUPPORT (10 tables)
// ============================================================================

export const kbArticle = pgTable("kb_article", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  categoryId: text("category_id").references(() => kbCategory.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id").references(() => user.id),
  viewCount: integer("view_count").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
});

export const kbArticleRelations = relations(kbArticle, ({ one, many }) => ({
  workspace: one(workspace, { fields: [kbArticle.workspaceId], references: [workspace.id] }),
  category: one(kbCategory, { fields: [kbArticle.categoryId], references: [kbCategory.id] }),
  author: one(user, { fields: [kbArticle.authorId], references: [user.id] }),
  tags: many(kbArticleTag),
}));

export const kbCategory = pgTable("kb_category", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  description: text("description"),
  parentId: text("parent_id"),
  displayOrder: integer("display_order"),
});

export const kbCategoryRelations = relations(kbCategory, ({ one, many }) => ({
  workspace: one(workspace, { fields: [kbCategory.workspaceId], references: [workspace.id] }),
  parent: one(kbCategory, { fields: [kbCategory.parentId], references: [kbCategory.id] }),
  children: many(kbCategory),
  articles: many(kbArticle),
}));

export const kbTag = pgTable("kb_tag", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull().unique(),
  color: text("color"),
});

export const kbTagRelations = relations(kbTag, ({ one, many }) => ({
  workspace: one(workspace, { fields: [kbTag.workspaceId], references: [workspace.id] }),
  articleTags: many(kbArticleTag),
}));

export const kbArticleTag = pgTable("kb_article_tag", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  articleId: text("article_id").notNull().references(() => kbArticle.id),
  tagId: text("tag_id").notNull().references(() => kbTag.id),
});

export const kbArticleTagRelations = relations(kbArticleTag, ({ one }) => ({
  workspace: one(workspace, { fields: [kbArticleTag.workspaceId], references: [workspace.id] }),
  article: one(kbArticle, { fields: [kbArticleTag.articleId], references: [kbArticle.id] }),
  tag: one(kbTag, { fields: [kbArticleTag.tagId], references: [kbTag.id] }),
}));

export const supportTicket = pgTable("support_ticket", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  ticketNumber: text("ticket_number").notNull().unique(),
  customerId: text("customer_id").references(() => crmContact.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  statusId: text("status_id").references(() => supportTicketStatus.id),
  priorityId: text("priority_id").references(() => supportTicketPriority.id),
  assignedTo: text("assigned_to").references(() => user.id),
  slaId: text("sla_id").references(() => supportSLA.id),
  dueDate: timestamp("due_date"),
  resolvedAt: timestamp("resolved_at"),
});

export const supportTicketRelations = relations(supportTicket, ({ one, many }) => ({
  workspace: one(workspace, { fields: [supportTicket.workspaceId], references: [workspace.id] }),
  customer: one(crmContact, { fields: [supportTicket.customerId], references: [crmContact.id] }),
  status: one(supportTicketStatus, { fields: [supportTicket.statusId], references: [supportTicketStatus.id] }),
  priority: one(supportTicketPriority, { fields: [supportTicket.priorityId], references: [supportTicketPriority.id] }),
  assignee: one(user, { fields: [supportTicket.assignedTo], references: [user.id] }),
  sla: one(supportSLA, { fields: [supportTicket.slaId], references: [supportSLA.id] }),
  responses: many(supportTicketResponse),
  escalations: many(supportEscalation),
}));

export const supportTicketStatus = pgTable("support_ticket_status", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  color: text("color"),
  isDefault: boolean("is_default").notNull().default(false),
  isClosed: boolean("is_closed").notNull().default(false),
});

export const supportTicketStatusRelations = relations(supportTicketStatus, ({ one, many }) => ({
  workspace: one(workspace, { fields: [supportTicketStatus.workspaceId], references: [workspace.id] }),
  tickets: many(supportTicket),
}));

export const supportTicketPriority = pgTable("support_ticket_priority", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  level: integer("level").notNull(),
  color: text("color"),
  responseTimeHours: integer("response_time_hours"),
});

export const supportTicketPriorityRelations = relations(supportTicketPriority, ({ one, many }) => ({
  workspace: one(workspace, { fields: [supportTicketPriority.workspaceId], references: [workspace.id] }),
  tickets: many(supportTicket),
}));

export const supportTicketResponse = pgTable("support_ticket_response", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  ticketId: text("ticket_id").notNull().references(() => supportTicket.id),
  responderId: text("responder_id").references(() => user.id),
  response: text("response").notNull(),
  isInternal: boolean("is_internal").notNull().default(false),
  responseDate: timestamp("response_date").notNull(),
});

export const supportTicketResponseRelations = relations(supportTicketResponse, ({ one }) => ({
  workspace: one(workspace, { fields: [supportTicketResponse.workspaceId], references: [workspace.id] }),
  ticket: one(supportTicket, { fields: [supportTicketResponse.ticketId], references: [supportTicket.id] }),
  responder: one(user, { fields: [supportTicketResponse.responderId], references: [user.id] }),
}));

export const supportSLA = pgTable("support_sla", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  responseTimeHours: integer("response_time_hours").notNull(),
  resolutionTimeHours: integer("resolution_time_hours").notNull(),
  description: text("description"),
});

export const supportSLARelations = relations(supportSLA, ({ one, many }) => ({
  workspace: one(workspace, { fields: [supportSLA.workspaceId], references: [workspace.id] }),
  tickets: many(supportTicket),
}));

export const supportEscalation = pgTable("support_escalation", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  ticketId: text("ticket_id").notNull().references(() => supportTicket.id),
  escalatedFrom: text("escalated_from").references(() => user.id),
  escalatedTo: text("escalated_to").references(() => user.id),
  reason: text("reason").notNull(),
  escalatedAt: timestamp("escalated_at").notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const supportEscalationRelations = relations(supportEscalation, ({ one }) => ({
  workspace: one(workspace, { fields: [supportEscalation.workspaceId], references: [workspace.id] }),
  ticket: one(supportTicket, { fields: [supportEscalation.ticketId], references: [supportTicket.id] }),
  escalator: one(user, { fields: [supportEscalation.escalatedFrom], references: [user.id] }),
  escalatee: one(user, { fields: [supportEscalation.escalatedTo], references: [user.id] }),
}));

// ============================================================================
// COMMUNICATION & COLLABORATION EXPANSION (9 tables)
// ============================================================================

export const chatChannel = pgTable("chat_channel", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  name: text("name").notNull(),
  description: text("description"),
  channelType: text("channel_type").notNull(),
  createdBy: text("created_by").references(() => user.id),
  isPrivate: boolean("is_private").notNull().default(false),
});

export const chatChannelRelations = relations(chatChannel, ({ one, many }) => ({
  workspace: one(workspace, { fields: [chatChannel.workspaceId], references: [workspace.id] }),
  creator: one(user, { fields: [chatChannel.createdBy], references: [user.id] }),
  members: many(chatChannelMember),
  messages: many(chatMessage),
}));

export const chatChannelMember = pgTable("chat_channel_member", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  channelId: text("channel_id").notNull().references(() => chatChannel.id),
  userId: text("user_id").notNull().references(() => user.id),
  role: text("role"),
  joinedAt: timestamp("joined_at").notNull(),
});

export const chatChannelMemberRelations = relations(chatChannelMember, ({ one }) => ({
  workspace: one(workspace, { fields: [chatChannelMember.workspaceId], references: [workspace.id] }),
  channel: one(chatChannel, { fields: [chatChannelMember.channelId], references: [chatChannel.id] }),
  user: one(user, { fields: [chatChannelMember.userId], references: [user.id] }),
}));

export const chatMessage = pgTable("chat_message", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  channelId: text("channel_id").references(() => chatChannel.id),
  threadId: text("thread_id").references(() => chatThread.id),
  senderId: text("sender_id").notNull().references(() => user.id),
  content: text("content").notNull(),
  messageType: text("message_type").notNull(),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
});

export const chatMessageRelations = relations(chatMessage, ({ one, many }) => ({
  workspace: one(workspace, { fields: [chatMessage.workspaceId], references: [workspace.id] }),
  channel: one(chatChannel, { fields: [chatMessage.channelId], references: [chatChannel.id] }),
  thread: one(chatThread, { fields: [chatMessage.threadId], references: [chatThread.id] }),
  sender: one(user, { fields: [chatMessage.senderId], references: [user.id] }),
  reactions: many(chatMessageReaction),
}));

export const chatMessageReaction = pgTable("chat_message_reaction", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  messageId: text("message_id").notNull().references(() => chatMessage.id),
  userId: text("user_id").notNull().references(() => user.id),
  emoji: text("emoji").notNull(),
});

export const chatMessageReactionRelations = relations(chatMessageReaction, ({ one }) => ({
  workspace: one(workspace, { fields: [chatMessageReaction.workspaceId], references: [workspace.id] }),
  message: one(chatMessage, { fields: [chatMessageReaction.messageId], references: [chatMessage.id] }),
  user: one(user, { fields: [chatMessageReaction.userId], references: [user.id] }),
}));

export const chatThread = pgTable("chat_thread", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  channelId: text("channel_id").notNull().references(() => chatChannel.id),
  parentMessageId: text("parent_message_id").notNull(),
  title: text("title"),
  lastReplyAt: timestamp("last_reply_at"),
});

export const chatThreadRelations = relations(chatThread, ({ one, many }) => ({
  workspace: one(workspace, { fields: [chatThread.workspaceId], references: [workspace.id] }),
  channel: one(chatChannel, { fields: [chatThread.channelId], references: [chatChannel.id] }),
  replies: many(chatMessage),
}));

export const emailAccount = pgTable("email_account", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  userId: text("user_id").notNull().references(() => user.id),
  emailAddress: text("email_address").$type<`${string}@${string}`>().notNull().unique(),
  provider: text("provider"),
  isDefault: boolean("is_default").notNull().default(false),
});

export const emailAccountRelations = relations(emailAccount, ({ one, many }) => ({
  workspace: one(workspace, { fields: [emailAccount.workspaceId], references: [workspace.id] }),
  user: one(user, { fields: [emailAccount.userId], references: [user.id] }),
  messages: many(emailMessage),
}));

export const emailMessage = pgTable("email_message", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  accountId: text("account_id").notNull().references(() => emailAccount.id),
  threadId: text("thread_id").references(() => emailThread.id),
  fromAddress: text("from_address").$type<`${string}@${string}`>().notNull(),
  toAddresses: jsonb("to_addresses").$type<string[]>().notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  sentAt: timestamp("sent_at").notNull(),
});

export const emailMessageRelations = relations(emailMessage, ({ one, many }) => ({
  workspace: one(workspace, { fields: [emailMessage.workspaceId], references: [workspace.id] }),
  account: one(emailAccount, { fields: [emailMessage.accountId], references: [emailAccount.id] }),
  thread: one(emailThread, { fields: [emailMessage.threadId], references: [emailThread.id] }),
  attachments: many(emailAttachment),
}));

export const emailThread = pgTable("email_thread", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  subject: text("subject").notNull(),
  lastMessageAt: timestamp("last_message_at"),
});

export const emailThreadRelations = relations(emailThread, ({ one, many }) => ({
  workspace: one(workspace, { fields: [emailThread.workspaceId], references: [workspace.id] }),
  messages: many(emailMessage),
}));

export const emailAttachment = pgTable("email_attachment", {
  ...sharedColumns,
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id),
  messageId: text("message_id").notNull().references(() => emailMessage.id),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type"),
  storageUrl: text("storage_url").notNull(),
});

export const emailAttachmentRelations = relations(emailAttachment, ({ one }) => ({
  workspace: one(workspace, { fields: [emailAttachment.workspaceId], references: [workspace.id] }),
  message: one(emailMessage, { fields: [emailAttachment.messageId], references: [emailMessage.id] }),
}));
