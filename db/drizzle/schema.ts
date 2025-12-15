import type {
  CustomJsonInterface,
  CustomJsonType,
} from '@drizzle-zero/custom-types';
import {defineRelations, sql} from 'drizzle-orm';
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

export const medium = pgTable('medium', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const message = pgTable('message', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  senderId: text('senderId').references(() => user.id),
  mediumId: text('mediumId').references(() => medium.id),
  body: text('body').notNull(),
  metadata: jsonb('metadata').$type<{key: string}>().notNull(),
  omittedColumn: text('omitted_column'),
});

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

export const telemetryRollup = pgTable('telemetry_rollup', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => project.id),
  metric: text('metric').notNull(),
  windowedStats: jsonb('windowed_stats')
    .$type<TemporalRollup<{dimension: string; metric: string}>>()
    .notNull(),
});

export const webhookSubscription = pgTable('webhook_subscription', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => project.id),
  config: jsonb('config').$type<WebhookConfig>().notNull(),
});

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

export const integrationCredential = pgTable('integration_credential', {
  ...sharedColumns,
  id: text('id').primaryKey(),
  webhookId: text('webhook_id').references(() => integrationWebhook.id),
  provider: text('provider').notNull(),
  clientId: text('client_id'),
  clientSecret: text('client_secret'),
  metadata: jsonb('metadata'),
});

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

export const relations = defineRelations(
  {
    user,
    medium,
    message,
    allTypes,
    friendship,
    filters,
    omittedTable,
    projectTag,
    project,
    projectPhase,
    projectTask,
    projectAssignment,
    projectComment,
    projectAttachment,
    projectTaskTag,
    projectNote,
    projectAudit,
    featureFlag,
    telemetryRollup,
    webhookSubscription,
    crmAccount,
    crmContact,
    crmPipelineStage,
    crmOpportunity,
    crmOpportunityStageHistory,
    crmActivityType,
    crmActivity,
    crmNote,
    productCategory,
    product,
    productVariant,
    productMedia,
    inventoryLocation,
    inventoryItem,
    inventoryLevel,
    orderTable,
    orderItem,
    payment,
    orderPayment,
    shipment,
    shipmentItem,
    department,
    team,
    employeeProfile,
    employmentHistory,
    employeeDocument,
    timesheet,
    timeEntry,
    benefitPlan,
    benefitEnrollment,
    supportTicket,
    supportTicketMessage,
    supportTicketTag,
    supportTicketTagLink,
    supportTicketAssignment,
    supportTicketAudit,
    billingInvoice,
    billingInvoiceLine,
    expenseReport,
    expenseItem,
    ledgerAccount,
    ledgerTransaction,
    ledgerEntry,
    budget,
    budgetLine,
    marketingCampaign,
    marketingChannel,
    marketingCampaignChannel,
    marketingAudience,
    marketingCampaignAudience,
    testSerialPk,
    testBigSerialPk,
    testUuidPk,
    testUuidSqlDefaultPk,
    testTextDefaultPk,
    testTimestampDefaultPk,
    testIntegerDefaultPk,
    testCompositePkBothDefaults,
    testCompositePkOneDefault,
    analyticsDashboard,
    analyticsWidget,
    analyticsWidgetQuery,
    integrationWebhook,
    integrationEvent,
    integrationCredential,
    documentLibrary,
    documentFolder,
    documentFile,
    documentFileVersion,
    documentSharing,
  },
  r => ({
    user: {
      messages: r.many.message(),
    },
    medium: {
      messages: r.many.message(),
    },
    message: {
      medium: r.one.medium({
        from: r.message.mediumId,
        to: r.medium.id,
      }),
      sender: r.one.user({
        from: r.message.senderId,
        to: r.user.id,
      }),
    },
    filters: {
      parent: r.one.filters({
        from: r.filters.parentId,
        to: r.filters.id,
      }),
      children: r.many.filters(),
    },
    projectTag: {
      taskLinks: r.many.projectTaskTag(),
    },
    project: {
      owner: r.one.user({
        from: r.project.ownerId,
        to: r.user.id,
      }),
      phases: r.many.projectPhase(),
      tasks: r.many.projectTask(),
      notes: r.many.projectNote(),
      audits: r.many.projectAudit(),
    },
    projectPhase: {
      project: r.one.project({
        from: r.projectPhase.projectId,
        to: r.project.id,
      }),
      tasks: r.many.projectTask(),
    },
    projectTask: {
      project: r.one.project({
        from: r.projectTask.projectId,
        to: r.project.id,
      }),
      phase: r.one.projectPhase({
        from: r.projectTask.phaseId,
        to: r.projectPhase.id,
      }),
      assignments: r.many.projectAssignment(),
      comments: r.many.projectComment(),
      attachments: r.many.projectAttachment(),
      tags: r.many.projectTaskTag(),
    },
    projectAssignment: {
      task: r.one.projectTask({
        from: r.projectAssignment.taskId,
        to: r.projectTask.id,
      }),
      user: r.one.user({
        from: r.projectAssignment.userId,
        to: r.user.id,
      }),
    },
    projectComment: {
      task: r.one.projectTask({
        from: r.projectComment.taskId,
        to: r.projectTask.id,
      }),
      author: r.one.user({
        from: r.projectComment.authorId,
        to: r.user.id,
      }),
    },
    projectAttachment: {
      task: r.one.projectTask({
        from: r.projectAttachment.taskId,
        to: r.projectTask.id,
      }),
    },
    projectTaskTag: {
      task: r.one.projectTask({
        from: r.projectTaskTag.taskId,
        to: r.projectTask.id,
      }),
      tag: r.one.projectTag({
        from: r.projectTaskTag.tagId,
        to: r.projectTag.id,
      }),
    },
    projectNote: {
      project: r.one.project({
        from: r.projectNote.projectId,
        to: r.project.id,
      }),
      author: r.one.user({
        from: r.projectNote.authorId,
        to: r.user.id,
      }),
    },
    projectAudit: {
      project: r.one.project({
        from: r.projectAudit.projectId,
        to: r.project.id,
      }),
      actor: r.one.user({
        from: r.projectAudit.actorId,
        to: r.user.id,
      }),
    },
    featureFlag: {
      owner: r.one.user({
        from: r.featureFlag.ownerId,
        to: r.user.id,
      }),
    },
    telemetryRollup: {
      project: r.one.project({
        from: r.telemetryRollup.projectId,
        to: r.project.id,
      }),
    },
    webhookSubscription: {
      project: r.one.project({
        from: r.webhookSubscription.projectId,
        to: r.project.id,
      }),
    },
    crmAccount: {
      owner: r.one.user({
        from: r.crmAccount.ownerId,
        to: r.user.id,
      }),
      contacts: r.many.crmContact(),
      opportunities: r.many.crmOpportunity(),
      activities: r.many.crmActivity(),
      notes: r.many.crmNote(),
    },
    crmContact: {
      account: r.one.crmAccount({
        from: r.crmContact.accountId,
        to: r.crmAccount.id,
      }),
      activities: r.many.crmActivity(),
      notes: r.many.crmNote(),
    },
    crmPipelineStage: {
      opportunities: r.many.crmOpportunity(),
      historyEntries: r.many.crmOpportunityStageHistory(),
    },
    crmOpportunity: {
      account: r.one.crmAccount({
        from: r.crmOpportunity.accountId,
        to: r.crmAccount.id,
      }),
      stage: r.one.crmPipelineStage({
        from: r.crmOpportunity.stageId,
        to: r.crmPipelineStage.id,
      }),
      activities: r.many.crmActivity(),
      historyEntries: r.many.crmOpportunityStageHistory(),
    },
    crmOpportunityStageHistory: {
      opportunity: r.one.crmOpportunity({
        from: r.crmOpportunityStageHistory.opportunityId,
        to: r.crmOpportunity.id,
      }),
      stage: r.one.crmPipelineStage({
        from: r.crmOpportunityStageHistory.stageId,
        to: r.crmPipelineStage.id,
      }),
      changedBy: r.one.user({
        from: r.crmOpportunityStageHistory.changedById,
        to: r.user.id,
      }),
    },
    crmActivityType: {
      activities: r.many.crmActivity(),
    },
    crmActivity: {
      account: r.one.crmAccount({
        from: r.crmActivity.accountId,
        to: r.crmAccount.id,
      }),
      contact: r.one.crmContact({
        from: r.crmActivity.contactId,
        to: r.crmContact.id,
      }),
      opportunity: r.one.crmOpportunity({
        from: r.crmActivity.opportunityId,
        to: r.crmOpportunity.id,
      }),
      type: r.one.crmActivityType({
        from: r.crmActivity.typeId,
        to: r.crmActivityType.id,
      }),
      performer: r.one.user({
        from: r.crmActivity.performedById,
        to: r.user.id,
      }),
    },
    crmNote: {
      account: r.one.crmAccount({
        from: r.crmNote.accountId,
        to: r.crmAccount.id,
      }),
      contact: r.one.crmContact({
        from: r.crmNote.contactId,
        to: r.crmContact.id,
      }),
      author: r.one.user({
        from: r.crmNote.authorId,
        to: r.user.id,
      }),
    },
    productCategory: {
      parent: r.one.productCategory({
        from: r.productCategory.parentId,
        to: r.productCategory.id,
      }),
      children: r.many.productCategory(),
      products: r.many.product(),
    },
    product: {
      category: r.one.productCategory({
        from: r.product.categoryId,
        to: r.productCategory.id,
      }),
      variants: r.many.productVariant(),
      media: r.many.productMedia(),
    },
    productVariant: {
      product: r.one.product({
        from: r.productVariant.productId,
        to: r.product.id,
      }),
      inventoryItems: r.many.inventoryItem(),
      inventoryLevels: r.many.inventoryLevel(),
      orderItems: r.many.orderItem(),
    },
    productMedia: {
      product: r.one.product({
        from: r.productMedia.productId,
        to: r.product.id,
      }),
    },
    inventoryLocation: {
      levels: r.many.inventoryLevel(),
    },
    inventoryItem: {
      variant: r.one.productVariant({
        from: r.inventoryItem.variantId,
        to: r.productVariant.id,
      }),
    },
    inventoryLevel: {
      location: r.one.inventoryLocation({
        from: r.inventoryLevel.locationId,
        to: r.inventoryLocation.id,
      }),
      variant: r.one.productVariant({
        from: r.inventoryLevel.variantId,
        to: r.productVariant.id,
      }),
    },
    orderTable: {
      customer: r.one.user({
        from: r.orderTable.customerId,
        to: r.user.id,
      }),
      opportunity: r.one.crmOpportunity({
        from: r.orderTable.opportunityId,
        to: r.crmOpportunity.id,
      }),
      items: r.many.orderItem(),
      payments: r.many.orderPayment(),
      shipments: r.many.shipment(),
    },
    orderItem: {
      order: r.one.orderTable({
        from: r.orderItem.orderId,
        to: r.orderTable.id,
      }),
      variant: r.one.productVariant({
        from: r.orderItem.variantId,
        to: r.productVariant.id,
      }),
    },
    orderPayment: {
      order: r.one.orderTable({
        from: r.orderPayment.orderId,
        to: r.orderTable.id,
      }),
      payment: r.one.payment({
        from: r.orderPayment.paymentId,
        to: r.payment.id,
      }),
    },
    shipment: {
      order: r.one.orderTable({
        from: r.shipment.orderId,
        to: r.orderTable.id,
      }),
      items: r.many.shipmentItem(),
    },
    shipmentItem: {
      shipment: r.one.shipment({
        from: r.shipmentItem.shipmentId,
        to: r.shipment.id,
      }),
      orderItem: r.one.orderItem({
        from: r.shipmentItem.orderItemId,
        to: r.orderItem.id,
      }),
    },
    department: {
      manager: r.one.user({
        from: r.department.managerId,
        to: r.user.id,
      }),
      teams: r.many.team(),
      employees: r.many.employeeProfile(),
    },
    employeeProfile: {
      user: r.one.user({
        from: r.employeeProfile.userId,
        to: r.user.id,
      }),
      department: r.one.department({
        from: r.employeeProfile.departmentId,
        to: r.department.id,
      }),
      team: r.one.team({
        from: r.employeeProfile.teamId,
        to: r.team.id,
      }),
      employmentHistory: r.many.employmentHistory(),
      documents: r.many.employeeDocument(),
      timesheets: r.many.timesheet(),
      benefitEnrollments: r.many.benefitEnrollment(),
    },
    team: {
      department: r.one.department({
        from: r.team.departmentId,
        to: r.department.id,
      }),
      lead: r.one.user({
        from: r.team.leadId,
        to: r.user.id,
      }),
      employees: r.many.employeeProfile(),
    },
    employmentHistory: {
      employee: r.one.employeeProfile({
        from: r.employmentHistory.employeeId,
        to: r.employeeProfile.id,
      }),
    },
    employeeDocument: {
      employee: r.one.employeeProfile({
        from: r.employeeDocument.employeeId,
        to: r.employeeProfile.id,
      }),
      uploader: r.one.user({
        from: r.employeeDocument.uploadedById,
        to: r.user.id,
      }),
    },
    timesheet: {
      employee: r.one.employeeProfile({
        from: r.timesheet.employeeId,
        to: r.employeeProfile.id,
      }),
      submittedBy: r.one.user({
        from: r.timesheet.submittedById,
        to: r.user.id,
      }),
      entries: r.many.timeEntry(),
    },
    timeEntry: {
      timesheet: r.one.timesheet({
        from: r.timeEntry.timesheetId,
        to: r.timesheet.id,
      }),
      task: r.one.projectTask({
        from: r.timeEntry.taskId,
        to: r.projectTask.id,
      }),
    },
    benefitPlan: {
      administrator: r.one.user({
        from: r.benefitPlan.administratorId,
        to: r.user.id,
      }),
      enrollments: r.many.benefitEnrollment(),
    },
    benefitEnrollment: {
      benefitPlan: r.one.benefitPlan({
        from: r.benefitEnrollment.benefitPlanId,
        to: r.benefitPlan.id,
      }),
      employee: r.one.employeeProfile({
        from: r.benefitEnrollment.employeeId,
        to: r.employeeProfile.id,
      }),
    },
    supportTicket: {
      customer: r.one.user({
        from: r.supportTicket.customerId,
        to: r.user.id,
      }),
      assignedTeam: r.one.team({
        from: r.supportTicket.assignedTeamId,
        to: r.team.id,
      }),
      messages: r.many.supportTicketMessage(),
      tags: r.many.supportTicketTagLink(),
      assignments: r.many.supportTicketAssignment(),
      audits: r.many.supportTicketAudit(),
    },
    supportTicketMessage: {
      ticket: r.one.supportTicket({
        from: r.supportTicketMessage.ticketId,
        to: r.supportTicket.id,
      }),
      author: r.one.user({
        from: r.supportTicketMessage.authorId,
        to: r.user.id,
      }),
    },
    supportTicketTag: {
      ticketLinks: r.many.supportTicketTagLink(),
    },
    supportTicketTagLink: {
      ticket: r.one.supportTicket({
        from: r.supportTicketTagLink.ticketId,
        to: r.supportTicket.id,
      }),
      tag: r.one.supportTicketTag({
        from: r.supportTicketTagLink.tagId,
        to: r.supportTicketTag.id,
      }),
    },
    supportTicketAssignment: {
      ticket: r.one.supportTicket({
        from: r.supportTicketAssignment.ticketId,
        to: r.supportTicket.id,
      }),
      assignee: r.one.user({
        from: r.supportTicketAssignment.assigneeId,
        to: r.user.id,
      }),
    },
    supportTicketAudit: {
      ticket: r.one.supportTicket({
        from: r.supportTicketAudit.ticketId,
        to: r.supportTicket.id,
      }),
      actor: r.one.user({
        from: r.supportTicketAudit.actorId,
        to: r.user.id,
      }),
    },
    billingInvoice: {
      account: r.one.crmAccount({
        from: r.billingInvoice.accountId,
        to: r.crmAccount.id,
      }),
      contact: r.one.crmContact({
        from: r.billingInvoice.contactId,
        to: r.crmContact.id,
      }),
      issuer: r.one.user({
        from: r.billingInvoice.issuedById,
        to: r.user.id,
      }),
      lines: r.many.billingInvoiceLine(),
    },
    billingInvoiceLine: {
      invoice: r.one.billingInvoice({
        from: r.billingInvoiceLine.invoiceId,
        to: r.billingInvoice.id,
      }),
      orderItem: r.one.orderItem({
        from: r.billingInvoiceLine.orderItemId,
        to: r.orderItem.id,
      }),
    },
    expenseReport: {
      owner: r.one.user({
        from: r.expenseReport.ownerId,
        to: r.user.id,
      }),
      department: r.one.department({
        from: r.expenseReport.departmentId,
        to: r.department.id,
      }),
      items: r.many.expenseItem(),
    },
    expenseItem: {
      report: r.one.expenseReport({
        from: r.expenseItem.reportId,
        to: r.expenseReport.id,
      }),
    },
    ledgerAccount: {
      parent: r.one.ledgerAccount({
        from: r.ledgerAccount.parentAccountId,
        to: r.ledgerAccount.id,
      }),
      children: r.many.ledgerAccount(),
      entries: r.many.ledgerEntry(),
      budgetLines: r.many.budgetLine(),
    },
    ledgerTransaction: {
      creator: r.one.user({
        from: r.ledgerTransaction.createdById,
        to: r.user.id,
      }),
      entries: r.many.ledgerEntry(),
    },
    ledgerEntry: {
      transaction: r.one.ledgerTransaction({
        from: r.ledgerEntry.transactionId,
        to: r.ledgerTransaction.id,
      }),
      account: r.one.ledgerAccount({
        from: r.ledgerEntry.accountId,
        to: r.ledgerAccount.id,
      }),
    },
    budget: {
      department: r.one.department({
        from: r.budget.departmentId,
        to: r.department.id,
      }),
      lines: r.many.budgetLine(),
    },
    budgetLine: {
      budget: r.one.budget({
        from: r.budgetLine.budgetId,
        to: r.budget.id,
      }),
      account: r.one.ledgerAccount({
        from: r.budgetLine.accountId,
        to: r.ledgerAccount.id,
      }),
    },
    marketingCampaign: {
      owner: r.one.user({
        from: r.marketingCampaign.ownerId,
        to: r.user.id,
      }),
      channels: r.many.marketingCampaignChannel(),
      audiences: r.many.marketingCampaignAudience(),
    },
    marketingChannel: {
      campaignChannels: r.many.marketingCampaignChannel(),
    },
    marketingCampaignChannel: {
      campaign: r.one.marketingCampaign({
        from: r.marketingCampaignChannel.campaignId,
        to: r.marketingCampaign.id,
      }),
      channel: r.one.marketingChannel({
        from: r.marketingCampaignChannel.channelId,
        to: r.marketingChannel.id,
      }),
    },
    marketingAudience: {
      campaignAudiences: r.many.marketingCampaignAudience(),
    },
    marketingCampaignAudience: {
      campaign: r.one.marketingCampaign({
        from: r.marketingCampaignAudience.campaignId,
        to: r.marketingCampaign.id,
      }),
      audience: r.one.marketingAudience({
        from: r.marketingCampaignAudience.audienceId,
        to: r.marketingAudience.id,
      }),
    },
    analyticsDashboard: {
      owner: r.one.user({
        from: r.analyticsDashboard.ownerId,
        to: r.user.id,
      }),
      widgets: r.many.analyticsWidget(),
    },
    analyticsWidget: {
      dashboard: r.one.analyticsDashboard({
        from: r.analyticsWidget.dashboardId,
        to: r.analyticsDashboard.id,
      }),
      queries: r.many.analyticsWidgetQuery(),
    },
    analyticsWidgetQuery: {
      widget: r.one.analyticsWidget({
        from: r.analyticsWidgetQuery.widgetId,
        to: r.analyticsWidget.id,
      }),
    },
    integrationWebhook: {
      project: r.one.project({
        from: r.integrationWebhook.projectId,
        to: r.project.id,
      }),
      account: r.one.crmAccount({
        from: r.integrationWebhook.accountId,
        to: r.crmAccount.id,
      }),
      events: r.many.integrationEvent(),
    },
    integrationEvent: {
      webhook: r.one.integrationWebhook({
        from: r.integrationEvent.webhookId,
        to: r.integrationWebhook.id,
      }),
    },
    integrationCredential: {
      webhook: r.one.integrationWebhook({
        from: r.integrationCredential.webhookId,
        to: r.integrationWebhook.id,
      }),
    },
    documentLibrary: {
      project: r.one.project({
        from: r.documentLibrary.projectId,
        to: r.project.id,
      }),
      folders: r.many.documentFolder(),
    },
    documentFolder: {
      library: r.one.documentLibrary({
        from: r.documentFolder.libraryId,
        to: r.documentLibrary.id,
      }),
      parent: r.one.documentFolder({
        from: r.documentFolder.parentId,
        to: r.documentFolder.id,
      }),
      children: r.many.documentFolder(),
      files: r.many.documentFile(),
    },
    documentFile: {
      folder: r.one.documentFolder({
        from: r.documentFile.folderId,
        to: r.documentFolder.id,
      }),
      uploader: r.one.user({
        from: r.documentFile.uploadedById,
        to: r.user.id,
      }),
      versions: r.many.documentFileVersion(),
      sharings: r.many.documentSharing(),
    },
    documentFileVersion: {
      file: r.one.documentFile({
        from: r.documentFileVersion.fileId,
        to: r.documentFile.id,
      }),
      uploader: r.one.user({
        from: r.documentFileVersion.uploadedById,
        to: r.user.id,
      }),
    },
    documentSharing: {
      file: r.one.documentFile({
        from: r.documentSharing.fileId,
        to: r.documentFile.id,
      }),
      user: r.one.user({
        from: r.documentSharing.sharedWithUserId,
        to: r.user.id,
      }),
      team: r.one.team({
        from: r.documentSharing.sharedWithTeamId,
        to: r.team.id,
      }),
    },
  }),
);
