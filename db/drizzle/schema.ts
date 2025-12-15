import type {
  CustomJsonInterface,
  CustomJsonType,
} from '@drizzle-zero/custom-types';
import {sql} from 'drizzle-orm';
import {relations} from 'drizzle-orm/_relations';
import {
  bigint,
  bigserial,
  boolean,
  char,
  date,
  doublePrecision,
  foreignKey,
  integer,
  json,
  jsonb,
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
} from 'drizzle-orm/pg-core';
import type {
  AnalyticsQuery,
  ChangeDataCaptureCheckpoint,
  FeatureFlag,
  FeatureFlagSnapshot,
  NotificationPreferences,
  ReleaseTrack,
  RuntimeFlagDefinition,
  SchemaDriftFinding,
  ShortCodeValue,
  TemporalRollup,
  WebhookConfig,
  WorkflowState,
} from './types';
import type {Country, USState} from './country';
import type {Currency, CurrencyCode} from './currency';
import type {ContentType} from './mime';

export interface TestInterface {
  nameInterface: 'custom-inline-interface';
}

export type TestExportedType = {
  nameType: 'custom-inline-type';
};

type TestType = {
  nameType: 'custom-inline-type';
};

type CountryIsoCode = Country['iso'];
type MimeKey = keyof ContentType;
type MimeDescriptor = ContentType[MimeKey];

const sharedColumns = {
  createdAt: timestamp('createdAt', {
    mode: 'string',
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updatedAt', {
    mode: 'string',
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
} as const;

export const user = pgTable('user', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  partner: boolean('partner').notNull(),
  email: text('email').$type<`${string}@${string}`>().notNull(),
  customTypeJson: jsonb('custom_type_json').$type<CustomJsonType>().notNull(),
  customInterfaceJson: jsonb('custom_interface_json')
    .$type<CustomJsonInterface>()
    .notNull(),
  testInterface: jsonb('test_interface').$type<TestInterface>().notNull(),
  testType: jsonb('test_type').$type<TestType>().notNull(),
  testExportedType: jsonb('test_exported_type')
    .$type<TestExportedType>()
    .notNull(),
  notificationPreferences: jsonb('notification_preferences')
    .$type<NotificationPreferences>()
    .notNull(),
  countryIso: char('country_iso', {length: 2})
    .$type<CountryIsoCode>()
    .notNull(),
  regionCode: char('region_code', {length: 2}).$type<USState | null>(),
  preferredCurrency: char('preferred_currency', {length: 3})
    .$type<CurrencyCode>()
    .notNull(),
  status: text('status', {enum: ['ASSIGNED', 'COMPLETED']}),
});

export const userRelations = relations(user, ({many}) => ({
  messages: many(message),
}));

export const medium = pgTable('medium', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const mediumRelations = relations(medium, ({many}) => ({
  messages: many(message),
}));

export const message = pgTable('message', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  senderId: text('senderId').references(() => user.id),
  mediumId: text('mediumId').references(() => medium.id),
  body: text('body').notNull(),
  metadata: jsonb('metadata').$type<{key: string}>().notNull(),
  omittedColumn: text('omitted_column'),
});

export const messageRelations = relations(message, ({one}) => ({
  medium: one(medium, {
    fields: [message.mediumId],
    references: [medium.id],
  }),
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
  }),
}));

export const statusEnum = pgEnum('status_type', [
  'active',
  'inactive',
  'pending',
]);

export const allTypes = pgTable('all_types', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  smallintField: smallint('smallint').notNull(),
  integerField: integer('integer').notNull(),
  bigintField: bigint('bigint', {mode: 'bigint'}).notNull(),
  bigintNumberField: bigint('bigint_number', {mode: 'number'}).notNull(),
  smallSerialField: smallserial('smallserial').notNull(),
  serialField: serial('serial').notNull(),
  bigSerialField: bigserial('bigserial', {mode: 'number'}).notNull(),
  numericField: numeric('numeric', {precision: 10, scale: 2}).notNull(),
  decimalField: numeric('decimal', {precision: 10, scale: 2}).notNull(),
  realField: real('real').notNull(),
  doublePrecisionField: doublePrecision('double_precision').notNull(),
  textField: text('text').notNull(),
  charField: char('char').notNull(),
  uuidField: uuid('uuid').notNull(),
  varcharField: varchar('varchar').notNull(),
  booleanField: boolean('boolean').notNull(),
  timestampField: timestamp('timestamp').notNull(),
  timestampTzField: timestamp('timestamp_tz', {withTimezone: true}).notNull(),
  timestampModeString: timestamp('timestamp_mode_string', {
    mode: 'string',
  }).notNull(),
  timestampModeDate: timestamp('timestamp_mode_date', {
    mode: 'date',
  }).notNull(),
  dateField: date('date').notNull(),
  jsonField: json('json').notNull(),
  jsonbField: jsonb('jsonb').notNull(),
  typedJsonField: jsonb('typed_json')
    .$type<{theme: string; fontSize: number}>()
    .notNull(),
  status: statusEnum('status').notNull(),
  textArray: text('text_array').array().notNull(),
  intArray: integer('int_array').array().notNull(),
  // boolArray: boolean("bool_array").array().notNull(),
  numericArray: numeric('numeric_array', {
    precision: 10,
    scale: 2,
    mode: 'number',
  })
    .array()
    .notNull(),
  uuidArray: uuid('uuid_array').array().notNull(),
  jsonbArray: jsonb('jsonb_array').array().$type<{key: string}[]>().notNull(),
  enumArray: statusEnum('enum_array').array().notNull(),
  optionalSmallint: smallint('optional_smallint'),
  optionalInteger: integer('optional_integer'),
  optionalBigint: bigint('optional_bigint', {mode: 'number'}),
  optionalNumeric: numeric('optional_numeric', {precision: 10, scale: 2}),
  optionalReal: real('optional_real'),
  optionalDoublePrecision: doublePrecision('optional_double_precision'),
  optionalText: text('optional_text'),
  optionalBoolean: boolean('optional_boolean'),
  optionalTimestamp: timestamp('optional_timestamp'),
  optionalJson: jsonb('optional_json'),
  optionalEnum: statusEnum('optional_enum'),
  optionalVarchar: varchar('optional_varchar'),
  optionalUuid: uuid('optional_uuid'),
});

// also testing snake case
export const friendship = pgTable(
  'friendship',
  {
    requestingId: text()
      .notNull()
      .references(() => user.id),
    acceptingId: text()
      .notNull()
      .references(() => user.id),
    accepted: boolean().notNull(),
  },
  t => [primaryKey({columns: [t.requestingId, t.acceptingId]})],
);

export const filters = pgTable('filters', {
  id: text('id').primaryKey(),
  name: text('name'),
  parentId: text('parent_id'),
});

export const filtersRelations = relations(filters, ({one, many}) => ({
  parent: one(filters, {
    fields: [filters.parentId],
    references: [filters.id],
  }),
  children: many(filters),
}));

export const omittedTable = pgTable('omitted_table', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const projectTag = pgTable('project_tag', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  color: text('color'),
});

export const project = pgTable('project', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  ownerId: text('owner_id').references(() => user.id),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status'),
  workflowState: jsonb('workflow_state').$type<WorkflowState>().notNull(),
});

export const projectPhase = pgTable('project_phase', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => project.id),
  name: text('name').notNull(),
  sequence: integer('sequence').notNull(),
});

export const projectTask = pgTable('project_task', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => project.id),
  phaseId: text('phase_id')
    .notNull()
    .references(() => projectPhase.id),
  title: text('title').notNull(),
  status: text('status').notNull(),
  priority: text('priority'),
});

export const projectAssignment = pgTable('project_assignment', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  taskId: text('task_id')
    .notNull()
    .references(() => projectTask.id),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  assignedAt: timestamp('assigned_at', {withTimezone: true}),
  role: text('role'),
});

export const projectComment = pgTable('project_comment', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  taskId: text('task_id')
    .notNull()
    .references(() => projectTask.id),
  authorId: text('author_id')
    .notNull()
    .references(() => user.id),
  body: text('body').notNull(),
});

export const projectAttachment = pgTable('project_attachment', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  taskId: text('task_id')
    .notNull()
    .references(() => projectTask.id),
  fileName: text('file_name').notNull(),
  fileType: text('file_type'),
});

export const projectTaskTag = pgTable('project_task_tag', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  taskId: text('task_id')
    .notNull()
    .references(() => projectTask.id),
  tagId: text('tag_id')
    .notNull()
    .references(() => projectTag.id),
});

export const projectNote = pgTable('project_note', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => project.id),
  authorId: text('author_id').references(() => user.id),
  note: text('note').notNull(),
});

export const projectAudit = pgTable('project_audit', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => project.id),
  actorId: text('actor_id').references(() => user.id),
  action: text('action').notNull(),
  details: jsonb('details').$type<SchemaDriftFinding[] | null>(),
});

export const projectTagRelations = relations(projectTag, ({many}) => ({
  taskLinks: many(projectTaskTag),
}));

export const projectRelations = relations(project, ({one, many}) => ({
  owner: one(user, {
    fields: [project.ownerId],
    references: [user.id],
  }),
  phases: many(projectPhase),
  tasks: many(projectTask),
  notes: many(projectNote),
  audits: many(projectAudit),
}));

export const projectPhaseRelations = relations(projectPhase, ({one, many}) => ({
  project: one(project, {
    fields: [projectPhase.projectId],
    references: [project.id],
  }),
  tasks: many(projectTask),
}));

export const projectTaskRelations = relations(projectTask, ({one, many}) => ({
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
  ({one}) => ({
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

export const projectCommentRelations = relations(projectComment, ({one}) => ({
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
  ({one}) => ({
    task: one(projectTask, {
      fields: [projectAttachment.taskId],
      references: [projectTask.id],
    }),
  }),
);

export const projectTaskTagRelations = relations(projectTaskTag, ({one}) => ({
  task: one(projectTask, {
    fields: [projectTaskTag.taskId],
    references: [projectTask.id],
  }),
  tag: one(projectTag, {
    fields: [projectTaskTag.tagId],
    references: [projectTag.id],
  }),
}));

export const projectNoteRelations = relations(projectNote, ({one}) => ({
  project: one(project, {
    fields: [projectNote.projectId],
    references: [project.id],
  }),
  author: one(user, {
    fields: [projectNote.authorId],
    references: [user.id],
  }),
}));

export const projectAuditRelations = relations(projectAudit, ({one}) => ({
  project: one(project, {
    fields: [projectAudit.projectId],
    references: [project.id],
  }),
  actor: one(user, {
    fields: [projectAudit.actorId],
    references: [user.id],
  }),
}));

export const featureFlag = pgTable('feature_flag', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  ownerId: text('owner_id').references(() => user.id),
  definition: jsonb('definition').$type<RuntimeFlagDefinition>().notNull(),
  metadata: jsonb('metadata').$type<FeatureFlag>().notNull(),
  snapshot: jsonb('snapshot').$type<FeatureFlagSnapshot>().notNull(),
  releaseTrack: text('release_track').$type<ReleaseTrack>().notNull(),
});

export const featureFlagRelations = relations(featureFlag, ({one}) => ({
  owner: one(user, {
    fields: [featureFlag.ownerId],
    references: [user.id],
  }),
}));

export const telemetryRollup = pgTable('telemetry_rollup', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => project.id),
  metric: text('metric').notNull(),
  windowedStats: jsonb('windowed_stats')
    .$type<TemporalRollup<{dimension: string; metric: string}>>()
    .notNull(),
});

export const telemetryRollupRelations = relations(telemetryRollup, ({one}) => ({
  project: one(project, {
    fields: [telemetryRollup.projectId],
    references: [project.id],
  }),
}));

export const webhookSubscription = pgTable('webhook_subscription', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => project.id),
  config: jsonb('config').$type<WebhookConfig>().notNull(),
});

export const webhookSubscriptionRelations = relations(
  webhookSubscription,
  ({one}) => ({
    project: one(project, {
      fields: [webhookSubscription.projectId],
      references: [project.id],
    }),
  }),
);

export const crmAccount = pgTable('crm_account', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  ownerId: text('owner_id').references(() => user.id),
  name: text('name').notNull(),
  industry: text('industry'),
  status: text('status'),
  domicileCountry: char('domicile_country', {
    length: 2,
  }).$type<CountryIsoCode | null>(),
  reportingCurrency: char('reporting_currency', {
    length: 3,
  }).$type<CurrencyCode | null>(),
});

export const crmContact = pgTable('crm_contact', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => crmAccount.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  countryIso: char('country_iso', {length: 2}).$type<CountryIsoCode | null>(),
  stateCode: char('state_code', {length: 2}).$type<USState | null>(),
});

export const crmPipelineStage = pgTable('crm_pipeline_stage', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sequence: integer('sequence').notNull(),
  probability: integer('probability'),
});

export const crmOpportunity = pgTable('crm_opportunity', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => crmAccount.id),
  stageId: text('stage_id')
    .notNull()
    .references(() => crmPipelineStage.id),
  name: text('name').notNull(),
  amount: numeric('amount', {precision: 12, scale: 2}),
  closeDate: date('close_date'),
});

export const crmOpportunityStageHistory = pgTable(
  'crm_opportunity_stage_history',
  {
    ...sharedColumns,
    id: text('id').primaryKey(),
    opportunityId: text('opportunity_id')
      .notNull()
      .references(() => crmOpportunity.id),
    stageId: text('stage_id')
      .notNull()
      .references(() => crmPipelineStage.id),
    changedById: text('changed_by_id').references(() => user.id),
    changedAt: timestamp('changed_at', {withTimezone: true})
      .defaultNow()
      .notNull(),
  },
);

export const crmActivityType = pgTable('crm_activity_type', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
});

export const crmActivity = pgTable('crm_activity', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => crmAccount.id),
  contactId: text('contact_id').references(() => crmContact.id),
  opportunityId: text('opportunity_id').references(() => crmOpportunity.id),
  typeId: text('type_id')
    .notNull()
    .references(() => crmActivityType.id),
  performedById: text('performed_by_id').references(() => user.id),
  notes: text('notes'),
});

export const crmNote = pgTable('crm_note', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => crmAccount.id),
  contactId: text('contact_id').references(() => crmContact.id),
  authorId: text('author_id').references(() => user.id),
  body: text('body').notNull(),
});

export const crmAccountRelations = relations(crmAccount, ({one, many}) => ({
  owner: one(user, {
    fields: [crmAccount.ownerId],
    references: [user.id],
  }),
  contacts: many(crmContact),
  opportunities: many(crmOpportunity),
  activities: many(crmActivity),
  notes: many(crmNote),
}));

export const crmContactRelations = relations(crmContact, ({one, many}) => ({
  account: one(crmAccount, {
    fields: [crmContact.accountId],
    references: [crmAccount.id],
  }),
  activities: many(crmActivity),
  notes: many(crmNote),
}));

export const crmPipelineStageRelations = relations(
  crmPipelineStage,
  ({many}) => ({
    opportunities: many(crmOpportunity),
    historyEntries: many(crmOpportunityStageHistory),
  }),
);

export const crmOpportunityRelations = relations(
  crmOpportunity,
  ({one, many}) => ({
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
  ({one}) => ({
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
  ({many}) => ({
    activities: many(crmActivity),
  }),
);

export const crmActivityRelations = relations(crmActivity, ({one}) => ({
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

export const crmNoteRelations = relations(crmNote, ({one}) => ({
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
  'product_category',
  {
    ...sharedColumns,
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    parentId: text('parent_id'),
  },
  table => ({
    parentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }),
  }),
);

export const product = pgTable('product', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  categoryId: text('category_id')
    .notNull()
    .references(() => productCategory.id),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status'),
});

export const productVariant = pgTable('product_variant', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  productId: text('product_id')
    .notNull()
    .references(() => product.id),
  sku: text('sku').notNull(),
  price: numeric('price', {precision: 12, scale: 2}).notNull(),
  currency: char('currency', {length: 3}).$type<CurrencyCode>().notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

export const productMedia = pgTable('product_media', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  productId: text('product_id')
    .notNull()
    .references(() => product.id),
  url: text('url').notNull(),
  type: text('type').$type<ShortCodeValue>().notNull(),
  mimeKey: text('mime_key').$type<MimeKey>().notNull(),
  mimeDescriptor: jsonb('mime_descriptor').$type<MimeDescriptor>().notNull(),
});

export const inventoryLocation = pgTable('inventory_location', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  region: text('region'),
  countryIso: char('country_iso', {length: 2}).$type<CountryIsoCode | null>(),
});

export const inventoryItem = pgTable('inventory_item', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  variantId: text('variant_id')
    .notNull()
    .references(() => productVariant.id),
  serialNumber: text('serial_number'),
  metadata: jsonb('metadata'),
});

export const inventoryLevel = pgTable('inventory_level', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  locationId: text('location_id')
    .notNull()
    .references(() => inventoryLocation.id),
  variantId: text('variant_id')
    .notNull()
    .references(() => productVariant.id),
  quantity: integer('quantity').notNull(),
  reserved: integer('reserved').default(0).notNull(),
});

export const orderTable = pgTable('order', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  customerId: text('customer_id').references(() => user.id),
  opportunityId: text('opportunity_id').references(() => crmOpportunity.id),
  status: text('status').notNull(),
  total: numeric('total', {precision: 12, scale: 2}).notNull(),
  currency: char('currency', {length: 3}).$type<CurrencyCode>().notNull(),
  currencyMetadata: jsonb('currency_metadata').$type<Currency>().notNull(),
  billingCountryIso: char('billing_country_iso', {length: 2})
    .$type<CountryIsoCode>()
    .notNull(),
  shippingCountryIso: char('shipping_country_iso', {length: 2})
    .$type<CountryIsoCode>()
    .notNull(),
  cdcCheckpoint: jsonb(
    'cdc_checkpoint',
  ).$type<ChangeDataCaptureCheckpoint | null>(),
});

export const orderItem = pgTable('order_item', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => orderTable.id),
  variantId: text('variant_id')
    .notNull()
    .references(() => productVariant.id),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', {precision: 12, scale: 2}).notNull(),
});

export const payment = pgTable('payment', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  externalRef: text('external_ref'),
  status: text('status').notNull(),
  amount: numeric('amount', {precision: 12, scale: 2}).notNull(),
  currency: char('currency', {length: 3}).$type<CurrencyCode>().notNull(),
  receivedAt: timestamp('received_at', {withTimezone: true}),
  receivedById: text('received_by_id').references(() => user.id),
});

export const orderPayment = pgTable('order_payment', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => orderTable.id),
  paymentId: text('payment_id').references(() => payment.id),
  amount: numeric('amount', {precision: 12, scale: 2}).notNull(),
  status: text('status').notNull(),
});

export const shipment = pgTable('shipment', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => orderTable.id),
  shippedAt: timestamp('shipped_at', {withTimezone: true}),
  deliveredAt: timestamp('delivered_at', {withTimezone: true}),
  carrier: text('carrier'),
  trackingNumber: text('tracking_number'),
  destinationCountry: char('destination_country', {length: 2})
    .$type<CountryIsoCode>()
    .notNull(),
  destinationState: char('destination_state', {
    length: 2,
  }).$type<USState | null>(),
});

export const shipmentItem = pgTable('shipment_item', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  shipmentId: text('shipment_id')
    .notNull()
    .references(() => shipment.id),
  orderItemId: text('order_item_id')
    .notNull()
    .references(() => orderItem.id),
  quantity: integer('quantity').notNull(),
});

export const productCategoryRelations = relations(
  productCategory,
  ({one, many}) => ({
    parent: one(productCategory, {
      fields: [productCategory.parentId],
      references: [productCategory.id],
    }),
    children: many(productCategory),
    products: many(product),
  }),
);

export const productRelations = relations(product, ({one, many}) => ({
  category: one(productCategory, {
    fields: [product.categoryId],
    references: [productCategory.id],
  }),
  variants: many(productVariant),
  media: many(productMedia),
}));

export const productVariantRelations = relations(
  productVariant,
  ({one, many}) => ({
    product: one(product, {
      fields: [productVariant.productId],
      references: [product.id],
    }),
    inventoryItems: many(inventoryItem),
    inventoryLevels: many(inventoryLevel),
    orderItems: many(orderItem),
  }),
);

export const productMediaRelations = relations(productMedia, ({one}) => ({
  product: one(product, {
    fields: [productMedia.productId],
    references: [product.id],
  }),
}));

export const inventoryLocationRelations = relations(
  inventoryLocation,
  ({many}) => ({
    levels: many(inventoryLevel),
  }),
);

export const inventoryItemRelations = relations(inventoryItem, ({one}) => ({
  variant: one(productVariant, {
    fields: [inventoryItem.variantId],
    references: [productVariant.id],
  }),
}));

export const inventoryLevelRelations = relations(inventoryLevel, ({one}) => ({
  location: one(inventoryLocation, {
    fields: [inventoryLevel.locationId],
    references: [inventoryLocation.id],
  }),
  variant: one(productVariant, {
    fields: [inventoryLevel.variantId],
    references: [productVariant.id],
  }),
}));

export const orderRelations = relations(orderTable, ({one, many}) => ({
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

export const orderItemRelations = relations(orderItem, ({one}) => ({
  order: one(orderTable, {
    fields: [orderItem.orderId],
    references: [orderTable.id],
  }),
  variant: one(productVariant, {
    fields: [orderItem.variantId],
    references: [productVariant.id],
  }),
}));

export const orderPaymentRelations = relations(orderPayment, ({one}) => ({
  order: one(orderTable, {
    fields: [orderPayment.orderId],
    references: [orderTable.id],
  }),
  payment: one(payment, {
    fields: [orderPayment.paymentId],
    references: [payment.id],
  }),
}));

export const shipmentRelations = relations(shipment, ({one, many}) => ({
  order: one(orderTable, {
    fields: [shipment.orderId],
    references: [orderTable.id],
  }),
  items: many(shipmentItem),
}));

export const shipmentItemRelations = relations(shipmentItem, ({one}) => ({
  shipment: one(shipment, {
    fields: [shipmentItem.shipmentId],
    references: [shipment.id],
  }),
  orderItem: one(orderItem, {
    fields: [shipmentItem.orderItemId],
    references: [orderItem.id],
  }),
}));

export const department = pgTable('department', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  managerId: text('manager_id').references(() => user.id),
});

export const team = pgTable('team', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  departmentId: text('department_id')
    .notNull()
    .references(() => department.id),
  leadId: text('lead_id').references(() => user.id),
  name: text('name').notNull(),
});

export const employeeProfile = pgTable('employee_profile', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  departmentId: text('department_id').references(() => department.id),
  teamId: text('team_id').references(() => team.id),
  title: text('title'),
  startDate: date('start_date'),
  employmentType: text('employment_type'),
});

export const employmentHistory = pgTable('employment_history', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  employeeId: text('employee_id')
    .notNull()
    .references(() => employeeProfile.id),
  company: text('company').notNull(),
  title: text('title').notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
});

export const employeeDocument = pgTable('employee_document', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  employeeId: text('employee_id')
    .notNull()
    .references(() => employeeProfile.id),
  fileName: text('file_name').notNull(),
  documentType: text('document_type'),
  uploadedById: text('uploaded_by_id').references(() => user.id),
});

export const timesheet = pgTable('timesheet', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  employeeId: text('employee_id')
    .notNull()
    .references(() => employeeProfile.id),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  submittedById: text('submitted_by_id').references(() => user.id),
  status: text('status').notNull(),
});

export const timeEntry = pgTable('time_entry', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  timesheetId: text('timesheet_id')
    .notNull()
    .references(() => timesheet.id),
  taskId: text('task_id').references(() => projectTask.id),
  hours: numeric('hours', {precision: 5, scale: 2}).notNull(),
  notes: text('notes'),
  entryDate: date('entry_date').notNull(),
});

export const benefitPlan = pgTable('benefit_plan', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  provider: text('provider'),
  description: text('description'),
  administratorId: text('administrator_id').references(() => user.id),
});

export const benefitEnrollment = pgTable('benefit_enrollment', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  benefitPlanId: text('benefit_plan_id')
    .notNull()
    .references(() => benefitPlan.id),
  employeeId: text('employee_id')
    .notNull()
    .references(() => employeeProfile.id),
  enrolledAt: timestamp('enrolled_at', {withTimezone: true}).notNull(),
  coverageLevel: text('coverage_level'),
});

export const departmentRelations = relations(department, ({one, many}) => ({
  manager: one(user, {
    fields: [department.managerId],
    references: [user.id],
  }),
  teams: many(team),
  employees: many(employeeProfile),
}));

export const employeeProfileRelations = relations(
  employeeProfile,
  ({one, many}) => ({
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

export const teamRelations = relations(team, ({one, many}) => ({
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
  ({one}) => ({
    employee: one(employeeProfile, {
      fields: [employmentHistory.employeeId],
      references: [employeeProfile.id],
    }),
  }),
);

export const employeeDocumentRelations = relations(
  employeeDocument,
  ({one}) => ({
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

export const timesheetRelations = relations(timesheet, ({one, many}) => ({
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

export const timeEntryRelations = relations(timeEntry, ({one}) => ({
  timesheet: one(timesheet, {
    fields: [timeEntry.timesheetId],
    references: [timesheet.id],
  }),
  task: one(projectTask, {
    fields: [timeEntry.taskId],
    references: [projectTask.id],
  }),
}));

export const benefitPlanRelations = relations(benefitPlan, ({one, many}) => ({
  administrator: one(user, {
    fields: [benefitPlan.administratorId],
    references: [user.id],
  }),
  enrollments: many(benefitEnrollment),
}));

export const benefitEnrollmentRelations = relations(
  benefitEnrollment,
  ({one}) => ({
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

export const supportTicket = pgTable('support_ticket', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  customerId: text('customer_id').references(() => user.id),
  assignedTeamId: text('assigned_team_id').references(() => team.id),
  subject: text('subject').notNull(),
  status: text('status').notNull(),
  priority: text('priority'),
  source: text('source'),
});

export const supportTicketMessage = pgTable('support_ticket_message', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  ticketId: text('ticket_id')
    .notNull()
    .references(() => supportTicket.id),
  authorId: text('author_id').references(() => user.id),
  body: text('body').notNull(),
  visibility: text('visibility'),
});

export const supportTicketTag = pgTable('support_ticket_tag', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  description: text('description'),
});

export const supportTicketTagLink = pgTable('support_ticket_tag_link', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  ticketId: text('ticket_id')
    .notNull()
    .references(() => supportTicket.id),
  tagId: text('tag_id')
    .notNull()
    .references(() => supportTicketTag.id),
});

export const supportTicketAssignment = pgTable('support_ticket_assignment', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  ticketId: text('ticket_id')
    .notNull()
    .references(() => supportTicket.id),
  assigneeId: text('assignee_id').references(() => user.id),
  assignedAt: timestamp('assigned_at', {withTimezone: true}),
  assignmentType: text('assignment_type'),
});

export const supportTicketAudit = pgTable('support_ticket_audit', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  ticketId: text('ticket_id')
    .notNull()
    .references(() => supportTicket.id),
  actorId: text('actor_id').references(() => user.id),
  action: text('action').notNull(),
  details: jsonb('details'),
});

export const supportTicketRelations = relations(
  supportTicket,
  ({one, many}) => ({
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
  ({one}) => ({
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
  ({many}) => ({
    ticketLinks: many(supportTicketTagLink),
  }),
);

export const supportTicketTagLinkRelations = relations(
  supportTicketTagLink,
  ({one}) => ({
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
  ({one}) => ({
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
  ({one}) => ({
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

export const billingInvoice = pgTable('billing_invoice', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => crmAccount.id),
  contactId: text('contact_id').references(() => crmContact.id),
  issuedById: text('issued_by_id').references(() => user.id),
  status: text('status').notNull(),
  invoiceDate: date('invoice_date').notNull(),
  dueDate: date('due_date'),
  totalAmount: numeric('total_amount', {precision: 12, scale: 2}).notNull(),
  currency: char('currency', {length: 3}).notNull(),
});

export const billingInvoiceLine = pgTable('billing_invoice_line', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id')
    .notNull()
    .references(() => billingInvoice.id),
  orderItemId: text('order_item_id').references(() => orderItem.id),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', {precision: 12, scale: 2}).notNull(),
});

export const expenseReport = pgTable('expense_report', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id),
  departmentId: text('department_id').references(() => department.id),
  status: text('status').notNull(),
  submittedAt: timestamp('submitted_at', {withTimezone: true}),
});

export const expenseItem = pgTable('expense_item', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  reportId: text('report_id')
    .notNull()
    .references(() => expenseReport.id),
  amount: numeric('amount', {precision: 12, scale: 2}).notNull(),
  category: text('category').notNull(),
  incurredAt: date('incurred_at'),
  merchant: text('merchant'),
  notes: text('notes'),
});

export const ledgerAccount = pgTable(
  'ledger_account',
  {
    ...sharedColumns,
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    code: text('code').notNull(),
    accountType: text('account_type').notNull(),
    parentAccountId: text('parent_account_id'),
  },
  table => ({
    parentFk: foreignKey({
      columns: [table.parentAccountId],
      foreignColumns: [table.id],
    }),
  }),
);

export const ledgerTransaction = pgTable('ledger_transaction', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  reference: text('reference'),
  transactionDate: date('transaction_date').notNull(),
  createdById: text('created_by_id').references(() => user.id),
  description: text('description'),
});

export const ledgerEntry = pgTable('ledger_entry', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  transactionId: text('transaction_id')
    .notNull()
    .references(() => ledgerTransaction.id),
  accountId: text('account_id')
    .notNull()
    .references(() => ledgerAccount.id),
  debit: numeric('debit', {precision: 12, scale: 2}),
  credit: numeric('credit', {precision: 12, scale: 2}),
  memo: text('memo'),
});

export const budget = pgTable('budget', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  departmentId: text('department_id').references(() => department.id),
  fiscalYear: integer('fiscal_year').notNull(),
  totalAmount: numeric('total_amount', {precision: 12, scale: 2}).notNull(),
  currency: char('currency', {length: 3}).notNull(),
});

export const budgetLine = pgTable('budget_line', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  budgetId: text('budget_id')
    .notNull()
    .references(() => budget.id),
  accountId: text('account_id')
    .notNull()
    .references(() => ledgerAccount.id),
  amount: numeric('amount', {precision: 12, scale: 2}).notNull(),
});

export const billingInvoiceRelations = relations(
  billingInvoice,
  ({one, many}) => ({
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
  ({one}) => ({
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
  ({one, many}) => ({
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

export const expenseItemRelations = relations(expenseItem, ({one}) => ({
  report: one(expenseReport, {
    fields: [expenseItem.reportId],
    references: [expenseReport.id],
  }),
}));

export const ledgerAccountRelations = relations(
  ledgerAccount,
  ({one, many}) => ({
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
  ({one, many}) => ({
    creator: one(user, {
      fields: [ledgerTransaction.createdById],
      references: [user.id],
    }),
    entries: many(ledgerEntry),
  }),
);

export const ledgerEntryRelations = relations(ledgerEntry, ({one}) => ({
  transaction: one(ledgerTransaction, {
    fields: [ledgerEntry.transactionId],
    references: [ledgerTransaction.id],
  }),
  account: one(ledgerAccount, {
    fields: [ledgerEntry.accountId],
    references: [ledgerAccount.id],
  }),
}));

export const budgetRelations = relations(budget, ({one, many}) => ({
  department: one(department, {
    fields: [budget.departmentId],
    references: [department.id],
  }),
  lines: many(budgetLine),
}));

export const budgetLineRelations = relations(budgetLine, ({one}) => ({
  budget: one(budget, {
    fields: [budgetLine.budgetId],
    references: [budget.id],
  }),
  account: one(ledgerAccount, {
    fields: [budgetLine.accountId],
    references: [ledgerAccount.id],
  }),
}));

export const marketingCampaign = pgTable('marketing_campaign', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  ownerId: text('owner_id').references(() => user.id),
  name: text('name').notNull(),
  status: text('status').notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  budgetAmount: numeric('budget_amount', {precision: 12, scale: 2}),
});

export const marketingChannel = pgTable('marketing_channel', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  channelType: text('channel_type'),
  costModel: text('cost_model'),
});

export const marketingCampaignChannel = pgTable('marketing_campaign_channel', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  campaignId: text('campaign_id')
    .notNull()
    .references(() => marketingCampaign.id),
  channelId: text('channel_id')
    .notNull()
    .references(() => marketingChannel.id),
  allocation: numeric('allocation', {precision: 12, scale: 2}),
});

export const marketingAudience = pgTable('marketing_audience', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  segmentType: text('segment_type'),
  definition: jsonb('definition'),
});

export const marketingCampaignAudience = pgTable(
  'marketing_campaign_audience',
  {
    ...sharedColumns,
    id: text('id').primaryKey(),
    campaignId: text('campaign_id')
      .notNull()
      .references(() => marketingCampaign.id),
    audienceId: text('audience_id')
      .notNull()
      .references(() => marketingAudience.id),
  },
);

export const marketingCampaignRelations = relations(
  marketingCampaign,
  ({one, many}) => ({
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
  ({many}) => ({
    campaignChannels: many(marketingCampaignChannel),
  }),
);

export const marketingCampaignChannelRelations = relations(
  marketingCampaignChannel,
  ({one}) => ({
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
  ({many}) => ({
    campaignAudiences: many(marketingCampaignAudience),
  }),
);

export const marketingCampaignAudienceRelations = relations(
  marketingCampaignAudience,
  ({one}) => ({
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

// Test tables for PK with default value issue
export const testSerialPk = pgTable('test_serial_pk', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const testBigSerialPk = pgTable('test_bigserial_pk', {
  id: bigserial('id', {mode: 'number'}).primaryKey(),
  name: text('name').notNull(),
});

export const testUuidPk = pgTable('test_uuid_pk', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
});

export const testUuidSqlDefaultPk = pgTable('test_uuid_sql_default_pk', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
});

export const testTextDefaultPk = pgTable('test_text_default_pk', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()::text`),
  name: text('name').notNull(),
});

export const testTimestampDefaultPk = pgTable('test_timestamp_default_pk', {
  id: timestamp('id').primaryKey().defaultNow(),
  name: text('name').notNull(),
});

export const testIntegerDefaultPk = pgTable('test_integer_default_pk', {
  id: integer('id')
    .primaryKey()
    .default(sql`floor(random() * 1000000)`),
  name: text('name').notNull(),
});

// Composite PK with both columns having defaults
export const testCompositePkBothDefaults = pgTable(
  'test_composite_pk_both_defaults',
  {
    id1: uuid('id1').defaultRandom().notNull(),
    id2: timestamp('id2').defaultNow().notNull(),
    name: text('name').notNull(),
  },
  t => [primaryKey({columns: [t.id1, t.id2]})],
);

// Composite PK with one column having a default
export const testCompositePkOneDefault = pgTable(
  'test_composite_pk_one_default',
  {
    tenantId: text('tenant_id').notNull(),
    id: serial('id').notNull(),
    name: text('name').notNull(),
  },
  t => [primaryKey({columns: [t.tenantId, t.id]})],
);

export const analyticsDashboard = pgTable('analytics_dashboard', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  ownerId: text('owner_id').references(() => user.id),
  title: text('title').notNull(),
  description: text('description'),
  defaultQuery: jsonb('default_query').$type<AnalyticsQuery>().notNull(),
});

export const analyticsWidget = pgTable('analytics_widget', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  dashboardId: text('dashboard_id')
    .notNull()
    .references(() => analyticsDashboard.id),
  title: text('title').notNull(),
  widgetType: text('widget_type').notNull(),
  position: integer('position'),
});

export const analyticsWidgetQuery = pgTable('analytics_widget_query', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  widgetId: text('widget_id')
    .notNull()
    .references(() => analyticsWidget.id),
  dataSource: text('data_source').notNull(),
  query: text('query').notNull(),
  refreshIntervalSeconds: integer('refresh_interval_seconds'),
});

export const analyticsDashboardRelations = relations(
  analyticsDashboard,
  ({one, many}) => ({
    owner: one(user, {
      fields: [analyticsDashboard.ownerId],
      references: [user.id],
    }),
    widgets: many(analyticsWidget),
  }),
);

export const analyticsWidgetRelations = relations(
  analyticsWidget,
  ({one, many}) => ({
    dashboard: one(analyticsDashboard, {
      fields: [analyticsWidget.dashboardId],
      references: [analyticsDashboard.id],
    }),
    queries: many(analyticsWidgetQuery),
  }),
);

export const analyticsWidgetQueryRelations = relations(
  analyticsWidgetQuery,
  ({one}) => ({
    widget: one(analyticsWidget, {
      fields: [analyticsWidgetQuery.widgetId],
      references: [analyticsWidget.id],
    }),
  }),
);

export const integrationWebhook = pgTable('integration_webhook', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => project.id),
  accountId: text('account_id').references(() => crmAccount.id),
  name: text('name').notNull(),
  url: text('url').notNull(),
  secret: text('secret'),
  isActive: boolean('is_active').notNull().default(true),
});

export const integrationEvent = pgTable('integration_event', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  webhookId: text('webhook_id')
    .notNull()
    .references(() => integrationWebhook.id),
  payload: jsonb('payload'),
  eventType: text('event_type').notNull(),
  deliveredAt: timestamp('delivered_at', {withTimezone: true}),
  status: text('status').notNull(),
});

export const integrationWebhookRelations = relations(
  integrationWebhook,
  ({one, many}) => ({
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
  ({one}) => ({
    webhook: one(integrationWebhook, {
      fields: [integrationEvent.webhookId],
      references: [integrationWebhook.id],
    }),
  }),
);

export const integrationCredential = pgTable('integration_credential', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  webhookId: text('webhook_id').references(() => integrationWebhook.id),
  provider: text('provider').notNull(),
  clientId: text('client_id'),
  clientSecret: text('client_secret'),
  metadata: jsonb('metadata'),
});

export const integrationCredentialRelations = relations(
  integrationCredential,
  ({one}) => ({
    webhook: one(integrationWebhook, {
      fields: [integrationCredential.webhookId],
      references: [integrationWebhook.id],
    }),
  }),
);

export const documentLibrary = pgTable('document_library', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => project.id),
  name: text('name').notNull(),
  description: text('description'),
  visibility: text('visibility'),
});

export const documentFolder = pgTable(
  'document_folder',
  {
    ...sharedColumns,
    id: text('id').primaryKey(),
    libraryId: text('library_id')
      .notNull()
      .references(() => documentLibrary.id),
    parentId: text('parent_id'),
    name: text('name').notNull(),
  },
  table => ({
    parentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }),
  }),
);

export const documentFile = pgTable('document_file', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  folderId: text('folder_id')
    .notNull()
    .references(() => documentFolder.id),
  uploadedById: text('uploaded_by_id').references(() => user.id),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type'),
  sizeBytes: integer('size_bytes'),
  version: integer('version').notNull().default(1),
});

export const documentFileVersion = pgTable('document_file_version', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  fileId: text('file_id')
    .notNull()
    .references(() => documentFile.id),
  uploadedById: text('uploaded_by_id').references(() => user.id),
  version: integer('version').notNull(),
  changeLog: text('change_log'),
  fileSizeBytes: integer('file_size_bytes'),
});

export const documentSharing = pgTable('document_sharing', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  fileId: text('file_id')
    .notNull()
    .references(() => documentFile.id),
  sharedWithUserId: text('shared_with_user_id').references(() => user.id),
  sharedWithTeamId: text('shared_with_team_id').references(() => team.id),
  permission: text('permission').notNull(),
});

export const documentLibraryRelations = relations(
  documentLibrary,
  ({one, many}) => ({
    project: one(project, {
      fields: [documentLibrary.projectId],
      references: [project.id],
    }),
    folders: many(documentFolder),
  }),
);

export const documentFolderRelations = relations(
  documentFolder,
  ({one, many}) => ({
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

export const documentFileRelations = relations(documentFile, ({one, many}) => ({
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
}));

export const documentFileVersionRelations = relations(
  documentFileVersion,
  ({one}) => ({
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

export const documentSharingRelations = relations(documentSharing, ({one}) => ({
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
}));
