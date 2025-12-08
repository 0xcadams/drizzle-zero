import type {StartedPostgreSqlContainer} from '@testcontainers/postgresql';
import {PostgreSqlContainer} from '@testcontainers/postgresql';
import {drizzle} from 'drizzle-orm/node-postgres';
import path from 'path';
import {Pool} from 'pg';
import postgres from 'postgres';
import type {StartedNetwork} from 'testcontainers';
import {
  GenericContainer,
  Network,
  PullPolicy,
  type StartedTestContainer,
} from 'testcontainers';
import {getShortCode} from './drizzle/types';
import * as drizzleSchema from './schema';
import {
  allTypes,
  analyticsDashboard,
  analyticsWidget,
  analyticsWidgetQuery,
  benefitEnrollment,
  benefitPlan,
  billingInvoice,
  billingInvoiceLine,
  budget,
  budgetLine,
  crmAccount,
  crmActivity,
  crmActivityType,
  crmContact,
  crmNote,
  crmOpportunity,
  crmOpportunityStageHistory,
  crmPipelineStage,
  department,
  documentFile,
  documentFileVersion,
  documentFolder,
  documentLibrary,
  documentSharing,
  employeeDocument,
  employeeProfile,
  employmentHistory,
  expenseItem,
  expenseReport,
  filters,
  friendship,
  integrationCredential,
  integrationEvent,
  integrationWebhook,
  inventoryItem,
  inventoryLevel,
  inventoryLocation,
  ledgerAccount,
  ledgerEntry,
  ledgerTransaction,
  marketingAudience,
  marketingCampaign,
  marketingCampaignAudience,
  marketingCampaignChannel,
  marketingChannel,
  medium,
  message,
  orderItem,
  orderPayment,
  orderTable,
  payment,
  product,
  productCategory,
  productMedia,
  productVariant,
  project,
  projectAssignment,
  projectAttachment,
  projectAudit,
  projectComment,
  projectNote,
  projectPhase,
  projectTag,
  projectTask,
  projectTaskTag,
  shipment,
  shipmentItem,
  supportTicket,
  supportTicketAssignment,
  supportTicketAudit,
  supportTicketMessage,
  supportTicketTag,
  supportTicketTagLink,
  team,
  timeEntry,
  timesheet,
  user,
} from './schema';

const versionInt = parseInt(process.env.PG_VERSION ?? '16');
const PG_PORT = 5732 + (versionInt - 16);
export const ZERO_PORT = 5949 + (versionInt - 16);

export const pool = new Pool({
  host: 'localhost',
  port: PG_PORT,
  user: 'user',
  password: 'password',
  database: 'drizzle_zero',
});

export const postgresJsClient = postgres(
  `postgres://user:password@localhost:${PG_PORT}/drizzle_zero`,
);

let startedNetwork: StartedNetwork | null = null;
let postgresContainer: StartedPostgreSqlContainer | null = null;
let zeroContainer: StartedTestContainer | null = null;

export const db = drizzle(pool, {
  schema: drizzleSchema,
});

export const seed = async () => {
  await db.insert(medium).values({id: '1', name: 'email'});
  await db.insert(medium).values({id: '2', name: 'teams'});
  await db.insert(medium).values({id: '3', name: 'sms'});
  await db.insert(medium).values({id: '4', name: 'whatsapp'});

  await db.insert(filters).values({id: '1', name: 'filter1'});
  await db.insert(filters).values({id: '2', name: 'filter2', parentId: '1'});
  await db.insert(filters).values({id: '3', name: 'filter3', parentId: '1'});

  await db.insert(user).values({
    id: '1',
    name: 'James',
    partner: true,
    email: 'james@example.com',
    customTypeJson: {
      id: '1',
      custom: 'this-is-imported-from-custom-types',
    },
    customInterfaceJson: {
      custom: 'this-interface-is-imported-from-custom-types',
    },
    testInterface: {
      nameInterface: 'custom-inline-interface',
    },
    testType: {
      nameType: 'custom-inline-type',
    },
    testExportedType: {
      nameType: 'custom-inline-type',
    },
    status: 'COMPLETED',
    notificationPreferences: [
      {
        channel: 'email',
        address: 'james@example.com',
        templateId: 'template-1',
      },
    ],
    countryIso: 'US',
    preferredCurrency: 'USD',
    regionCode: 'CA',
  });
  await db.insert(user).values({
    id: '2',
    name: 'John',
    partner: false,
    email: 'john@example.com',
    customTypeJson: {
      id: '2',
      custom: 'this-is-imported-from-custom-types',
    },
    customInterfaceJson: {
      custom: 'this-interface-is-imported-from-custom-types',
    },
    testInterface: {
      nameInterface: 'custom-inline-interface',
    },
    testType: {
      nameType: 'custom-inline-type',
    },
    testExportedType: {
      nameType: 'custom-inline-type',
    },
    notificationPreferences: [
      {
        channel: 'email',
        address: 'john@example.com',
        templateId: 'template-1',
      },
    ],
    countryIso: 'US',
    preferredCurrency: 'USD',
    regionCode: 'CA',
  });
  await db.insert(user).values({
    id: '3',
    name: 'Jane',
    partner: false,
    email: 'jane@example.com',
    customTypeJson: {
      id: '3',
      custom: 'this-is-imported-from-custom-types',
    },
    customInterfaceJson: {
      custom: 'this-interface-is-imported-from-custom-types',
    },
    testInterface: {
      nameInterface: 'custom-inline-interface',
    },
    testType: {
      nameType: 'custom-inline-type',
    },
    testExportedType: {
      nameType: 'custom-inline-type',
    },
    status: 'ASSIGNED',
    notificationPreferences: [
      {
        channel: 'email',
        address: 'jane@example.com',
        templateId: 'template-1',
      },
    ],
    countryIso: 'US',
    preferredCurrency: 'USD',
    regionCode: 'CA',
  });

  await db.insert(message).values({
    id: '1',
    body: 'Hey, James!',
    senderId: '1',
    mediumId: '1',
    metadata: {key: 'value1'},
  });

  await db.insert(message).values({
    id: '2',
    body: 'Hello on Teams',
    senderId: '2',
    mediumId: '2',
    metadata: {key: 'value2'},
  });

  await db.insert(message).values({
    id: '3',
    body: 'SMS message here',
    senderId: '3',
    mediumId: '3',
    metadata: {key: 'value3'},
  });

  await db.insert(message).values({
    id: '4',
    body: 'WhatsApp message',
    senderId: '2',
    mediumId: '4',
    metadata: {key: 'value4'},
  });

  await db.insert(message).values({
    id: '5',
    body: 'Thomas!',
    senderId: '1',
    mediumId: '4',
    metadata: {key: 'value5'},
  });

  await db.insert(user).values([
    {
      id: '4',
      name: 'Thomas',
      partner: true,
      email: 'thomas@example.com',
      customTypeJson: {
        id: '4',
        custom: 'this-is-imported-from-custom-types',
      },
      customInterfaceJson: {
        custom: 'this-interface-is-imported-from-custom-types',
      },
      testInterface: {
        nameInterface: 'custom-inline-interface',
      },
      testType: {
        nameType: 'custom-inline-type',
      },
      testExportedType: {
        nameType: 'custom-inline-type',
      },
      status: 'COMPLETED',
      notificationPreferences: [
        {
          channel: 'email',
          address: 'thomas@example.com',
          templateId: 'template-1',
        },
      ],
      countryIso: 'US',
      preferredCurrency: 'USD',
      regionCode: 'CA',
    },
    {
      id: '5',
      name: 'Priya',
      partner: true,
      email: 'priya@example.com',
      customTypeJson: {
        id: '5',
        custom: 'this-is-imported-from-custom-types',
      },
      customInterfaceJson: {
        custom: 'this-interface-is-imported-from-custom-types',
      },
      testInterface: {
        nameInterface: 'custom-inline-interface',
      },
      testType: {
        nameType: 'custom-inline-type',
      },
      testExportedType: {
        nameType: 'custom-inline-type',
      },
      status: 'COMPLETED',
      notificationPreferences: [
        {
          channel: 'email',
          address: 'priya@example.com',
          templateId: 'template-1',
        },
      ],
      countryIso: 'US',
      preferredCurrency: 'USD',
      regionCode: 'CA',
    },
    {
      id: '6',
      name: 'Liu',
      partner: false,
      email: 'liu@example.com',
      customTypeJson: {
        id: '6',
        custom: 'this-is-imported-from-custom-types',
      },
      customInterfaceJson: {
        custom: 'this-interface-is-imported-from-custom-types',
      },
      testInterface: {
        nameInterface: 'custom-inline-interface',
      },
      testType: {
        nameType: 'custom-inline-type',
      },
      testExportedType: {
        nameType: 'custom-inline-type',
      },
      status: 'ASSIGNED',
      notificationPreferences: [
        {
          channel: 'email',
          address: 'liu@example.com',
          templateId: 'template-1',
        },
      ],
      countryIso: 'US',
      preferredCurrency: 'USD',
      regionCode: 'CA',
    },
    {
      id: '7',
      name: 'Amelia',
      partner: false,
      email: 'amelia@example.com',
      customTypeJson: {
        id: '7',
        custom: 'this-is-imported-from-custom-types',
      },
      customInterfaceJson: {
        custom: 'this-interface-is-imported-from-custom-types',
      },
      testInterface: {
        nameInterface: 'custom-inline-interface',
      },
      testType: {
        nameType: 'custom-inline-type',
      },
      testExportedType: {
        nameType: 'custom-inline-type',
      },
      status: 'ASSIGNED',
      notificationPreferences: [
        {
          channel: 'email',
          address: 'amelia@example.com',
          templateId: 'template-1',
        },
      ],
      countryIso: 'US',
      preferredCurrency: 'USD',
      regionCode: 'CA',
    },
  ]);

  await db.insert(message).values([
    {
      id: '6',
      body: 'Looping in the ops team now.',
      senderId: '4',
      mediumId: '1',
      metadata: {key: 'value6'},
    },
    {
      id: '7',
      body: 'Weekly sync invite sent.',
      senderId: '5',
      mediumId: '2',
      metadata: {key: 'value7'},
    },
    {
      id: '8',
      body: 'Inventory alert triggered.',
      senderId: '6',
      mediumId: '3',
      metadata: {key: 'value8'},
    },
    {
      id: '9',
      body: 'Design mockups ready for review.',
      senderId: '7',
      mediumId: '4',
      metadata: {key: 'value9'},
    },
  ]);

  await db.insert(projectTag).values([
    {id: 'project-tag-design', label: 'Design', color: '#FF8A65'},
    {id: 'project-tag-backlog', label: 'Backlog', color: '#4DB6AC'},
    {id: 'project-tag-customer', label: 'Customer', color: '#9575CD'},
  ]);

  await db.insert(project).values([
    {
      id: 'project-ops',
      ownerId: '4',
      name: 'Operations Platform Revamp',
      description: 'Consolidate tooling for ops and customer success.',
      status: 'in_progress',
      workflowState: {
        state: 'scheduled',
        updatedBy: '4',
        runAtIso: new Date().toISOString(),
      },
    },
    {
      id: 'project-marketing',
      ownerId: '5',
      name: 'Marketing Launch Q4',
      description: 'Coordinated launch campaign for Q4 initiatives.',
      status: 'planning',
      workflowState: {
        state: 'failed',
        failedAtIso: new Date().toISOString(),
        reason: 'Failed to launch campaign',
        retryable: true,
      },
    },
  ]);

  await db.insert(projectPhase).values([
    {
      id: 'phase-discovery',
      projectId: 'project-ops',
      name: 'Discovery',
      sequence: 1,
    },
    {
      id: 'phase-build',
      projectId: 'project-ops',
      name: 'Build',
      sequence: 2,
    },
    {
      id: 'phase-launch',
      projectId: 'project-marketing',
      name: 'Launch',
      sequence: 1,
    },
  ]);

  await db.insert(projectTask).values([
    {
      id: 'task-user-research',
      projectId: 'project-ops',
      phaseId: 'phase-discovery',
      title: 'Interview frontline teams',
      status: 'in_progress',
      priority: 'high',
    },
    {
      id: 'task-automation',
      projectId: 'project-ops',
      phaseId: 'phase-build',
      title: 'Automate onboarding workflow',
      status: 'blocked',
      priority: 'critical',
    },
    {
      id: 'task-launch-plan',
      projectId: 'project-marketing',
      phaseId: 'phase-launch',
      title: 'Publish launch day checklist',
      status: 'todo',
      priority: 'medium',
    },
  ]);

  await db.insert(projectAssignment).values([
    {
      id: 'assignment-1',
      taskId: 'task-user-research',
      userId: '5',
      assignedAt: new Date('2024-03-01T09:00:00Z'),
      role: 'Research Lead',
    },
    {
      id: 'assignment-2',
      taskId: 'task-automation',
      userId: '6',
      assignedAt: new Date('2024-03-05T10:30:00Z'),
      role: 'Automation Engineer',
    },
    {
      id: 'assignment-3',
      taskId: 'task-launch-plan',
      userId: '7',
      assignedAt: new Date('2024-03-07T15:15:00Z'),
      role: 'Campaign Coordinator',
    },
  ]);

  await db.insert(projectComment).values([
    {
      id: 'comment-1',
      taskId: 'task-user-research',
      authorId: '5',
      body: 'User interviews scheduled for next Tuesday.',
    },
    {
      id: 'comment-2',
      taskId: 'task-automation',
      authorId: '6',
      body: 'Waiting on API credentials from the vendor.',
    },
  ]);

  await db.insert(projectAttachment).values([
    {
      id: 'attachment-1',
      taskId: 'task-user-research',
      fileName: 'interview-script.docx',
      fileType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    {
      id: 'attachment-2',
      taskId: 'task-automation',
      fileName: 'workflow-diagram.png',
      fileType: 'image/png',
    },
  ]);

  await db.insert(projectTaskTag).values([
    {
      id: 'tasktag-1',
      taskId: 'task-user-research',
      tagId: 'project-tag-customer',
    },
    {
      id: 'tasktag-2',
      taskId: 'task-automation',
      tagId: 'project-tag-backlog',
    },
    {
      id: 'tasktag-3',
      taskId: 'task-launch-plan',
      tagId: 'project-tag-design',
    },
  ]);

  await db.insert(projectNote).values([
    {
      id: 'project-note-1',
      projectId: 'project-ops',
      authorId: '4',
      note: 'Ops revamp aligns with Q3 retention goals.',
    },
    {
      id: 'project-note-2',
      projectId: 'project-marketing',
      authorId: '5',
      note: 'Coordinate launch with CRM opportunity milestones.',
    },
  ]);

  await db.insert(projectAudit).values([
    {
      id: 'project-audit-1',
      projectId: 'project-ops',
      actorId: '4',
      action: 'STATUS_CHANGE',
      details: [
        {
          severity: 'info',
          detectedAtIso: new Date().toISOString(),
          diffs: [{op: 'set', path: 'status', value: 'in_progress'}],
        },
      ],
    },
    {
      id: 'project-audit-2',
      projectId: 'project-marketing',
      actorId: '5',
      action: 'PHASE_ADDED',
      details: [
        {
          severity: 'info',
          detectedAtIso: new Date().toISOString(),
          diffs: [{op: 'set', path: 'phaseId', value: 'phase-launch'}],
        },
      ],
    },
  ]);

  await db.insert(documentLibrary).values([
    {
      id: 'library-ops',
      projectId: 'project-ops',
      name: 'Ops Shared Docs',
      description: 'Documentation for the ops revamp program.',
      visibility: 'team',
    },
  ]);

  await db.insert(documentFolder).values([
    {
      id: 'folder-root',
      libraryId: 'library-ops',
      name: 'Root',
    },
    {
      id: 'folder-research',
      libraryId: 'library-ops',
      parentId: 'folder-root',
      name: 'Research',
    },
  ]);

  await db.insert(documentFile).values([
    {
      id: 'file-brief',
      folderId: 'folder-root',
      uploadedById: '4',
      fileName: 'program-brief.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 524288,
      version: 1,
    },
    {
      id: 'file-notes',
      folderId: 'folder-research',
      uploadedById: '5',
      fileName: 'interview-notes.txt',
      mimeType: 'text/plain',
      sizeBytes: 20480,
      version: 2,
    },
  ]);

  await db.insert(documentFileVersion).values([
    {
      id: 'filever-brief-1',
      fileId: 'file-brief',
      uploadedById: '4',
      version: 1,
      changeLog: 'Initial draft of the program brief.',
      fileSizeBytes: 524288,
    },
    {
      id: 'filever-notes-2',
      fileId: 'file-notes',
      uploadedById: '5',
      version: 2,
      changeLog: 'Added insights from customer interviews.',
      fileSizeBytes: 20480,
    },
  ]);

  await db.insert(crmAccount).values([
    {
      id: 'acct-aurora',
      ownerId: '1',
      name: 'Aurora Manufacturing',
      industry: 'Manufacturing',
      status: 'active',
    },
    {
      id: 'acct-lumen',
      ownerId: '5',
      name: 'Lumen Retail Group',
      industry: 'Retail',
      status: 'prospect',
    },
  ]);

  await db.insert(crmContact).values([
    {
      id: 'contact-alana',
      accountId: 'acct-aurora',
      firstName: 'Alana',
      lastName: 'Murphy',
      email: 'alana.murphy@aurora.example.com',
      phone: '+1-555-0142',
    },
    {
      id: 'contact-ravi',
      accountId: 'acct-lumen',
      firstName: 'Ravi',
      lastName: 'Singh',
      email: 'ravi.singh@lumen.example.com',
      phone: '+1-555-2377',
    },
  ]);

  await db.insert(crmPipelineStage).values([
    {
      id: 'stage-qualify',
      name: 'Qualification',
      sequence: 1,
      probability: 20,
    },
    {id: 'stage-proposal', name: 'Proposal', sequence: 2, probability: 45},
    {
      id: 'stage-negotiation',
      name: 'Negotiation',
      sequence: 3,
      probability: 70,
    },
  ]);

  await db.insert(crmOpportunity).values([
    {
      id: 'opp-aurora-platform',
      accountId: 'acct-aurora',
      stageId: 'stage-proposal',
      name: 'Aurora Ops Platform',
      amount: '180000.00',
      closeDate: '2024-06-30',
    },
  ]);

  await db.insert(crmOpportunityStageHistory).values([
    {
      id: 'opp-stagehist-1',
      opportunityId: 'opp-aurora-platform',
      stageId: 'stage-qualify',
      changedById: '1',
    },
    {
      id: 'opp-stagehist-2',
      opportunityId: 'opp-aurora-platform',
      stageId: 'stage-proposal',
      changedById: '4',
    },
  ]);

  await db.insert(crmActivityType).values([
    {
      id: 'activity-call',
      name: 'Call',
      description: 'Phone or VoIP conversations.',
    },
    {
      id: 'activity-demo',
      name: 'Product Demo',
      description: 'Live product walkthrough.',
    },
  ]);

  await db.insert(crmActivity).values([
    {
      id: 'activity-1',
      accountId: 'acct-aurora',
      contactId: 'contact-alana',
      opportunityId: 'opp-aurora-platform',
      typeId: 'activity-call',
      performedById: '7',
      notes: 'Discussed integration requirements and security posture.',
    },
    {
      id: 'activity-2',
      accountId: 'acct-lumen',
      contactId: 'contact-ravi',
      typeId: 'activity-demo',
      performedById: '5',
      notes: 'Introduced marketing automation capabilities.',
    },
  ]);

  await db.insert(crmNote).values([
    {
      id: 'crm-note-aurora',
      accountId: 'acct-aurora',
      contactId: 'contact-alana',
      authorId: '1',
      body: 'Alana is focused on uptime and auditability.',
    },
  ]);

  await db.insert(productCategory).values([
    {
      id: 'cat-platform',
      name: 'Platform',
      description: 'Core SaaS platform modules',
    },
    {
      id: 'cat-services',
      name: 'Services',
      description: 'Professional services and onboarding',
    },
  ]);

  await db.insert(product).values([
    {
      id: 'product-zero',
      categoryId: 'cat-platform',
      name: 'Zero Workflows',
      description: 'Workflow automation subscription',
      status: 'active',
    },
    {
      id: 'product-onboarding',
      categoryId: 'cat-services',
      name: 'Whiteglove Onboarding',
      description: 'Implementation and training package',
      status: 'active',
    },
  ]);

  await db.insert(productVariant).values([
    {
      id: 'variant-zero-enterprise',
      productId: 'product-zero',
      sku: 'ZERO-ENT-12',
      price: '8999.00',
      currency: 'USD',
      isActive: true,
    },
    {
      id: 'variant-onboarding-std',
      productId: 'product-onboarding',
      sku: 'SERV-ONB-01',
      price: '4500.00',
      currency: 'USD',
      isActive: true,
    },
  ]);

  await db.insert(productMedia).values([
    {
      id: 'media-zero',
      productId: 'product-zero',
      url: 'https://cdn.example.com/products/zero-workflows/overview.png',
      type: getShortCode('image'),
      mimeKey: 'png',
      mimeDescriptor: {
        mime_type: 'image/png',
        group: 'image',
        description: 'PNG image',
        extensions: ['png'],
        is_text: false,
      },
    },
    {
      id: 'media-onboarding',
      productId: 'product-onboarding',
      url: 'https://cdn.example.com/products/onboarding/guide.pdf',
      type: getShortCode('document'),
      mimeKey: 'pdf',
      mimeDescriptor: {
        mime_type: 'application/pdf',
        group: 'document',
        description: 'PDF document',
        extensions: ['pdf'],
        is_text: false,
      },
    },
  ]);

  await db.insert(inventoryLocation).values([
    {
      id: 'inventory-remote',
      name: 'Remote Delivery',
      address: '123 Cloud Way',
      region: 'Global',
    },
  ]);

  await db.insert(inventoryLevel).values([
    {
      id: 'inventorylevel-zero',
      locationId: 'inventory-remote',
      variantId: 'variant-zero-enterprise',
      quantity: 50,
      reserved: 5,
    },
    {
      id: 'inventorylevel-onboarding',
      locationId: 'inventory-remote',
      variantId: 'variant-onboarding-std',
      quantity: 20,
      reserved: 2,
    },
  ]);

  await db.insert(inventoryItem).values([
    {
      id: 'inventoryitem-zero-001',
      variantId: 'variant-zero-enterprise',
      serialNumber: 'ZERO-ENT-001',
      metadata: {licenseSeats: 500},
    },
  ]);

  await db.insert(orderTable).values([
    {
      id: 'order-1001',
      customerId: '2',
      opportunityId: 'opp-aurora-platform',
      status: 'processing',
      total: '22498.00',
      currency: 'AFN',
      currencyMetadata: {
        code: 'AFN',
        number: '971',
        digits: 2,
        currency: 'Afghani',
        countries: ['AFG'],
      },
      billingCountryIso: 'AF',
      shippingCountryIso: 'AF',
    },
  ]);

  await db.insert(orderItem).values([
    {
      id: 'orderitem-1',
      orderId: 'order-1001',
      variantId: 'variant-zero-enterprise',
      quantity: 2,
      unitPrice: '8999.00',
    },
    {
      id: 'orderitem-2',
      orderId: 'order-1001',
      variantId: 'variant-onboarding-std',
      quantity: 1,
      unitPrice: '4500.00',
    },
  ]);

  await db.insert(payment).values([
    {
      id: 'payment-1',
      externalRef: 'PAY-789',
      status: 'captured',
      amount: '15000.00',
      currency: 'USD',
      receivedAt: new Date('2024-05-15T12:00:00Z'),
      receivedById: '4',
    },
    {
      id: 'payment-2',
      externalRef: 'PAY-790',
      status: 'pending',
      amount: '7498.00',
      currency: 'USD',
      receivedById: '4',
    },
  ]);

  await db.insert(orderPayment).values([
    {
      id: 'orderpayment-1',
      orderId: 'order-1001',
      paymentId: 'payment-1',
      amount: '15000.00',
      status: 'captured',
    },
    {
      id: 'orderpayment-2',
      orderId: 'order-1001',
      paymentId: 'payment-2',
      amount: '7498.00',
      status: 'pending',
    },
  ]);

  await db.insert(shipment).values([
    {
      id: 'shipment-1',
      orderId: 'order-1001',
      shippedAt: new Date('2024-05-20T08:00:00Z'),
      carrier: 'Digital Delivery',
      trackingNumber: 'DD-2024-1001',
      destinationCountry: 'AF',
      destinationState: 'DC',
    },
  ]);

  await db.insert(shipmentItem).values([
    {
      id: 'shipmentitem-1',
      shipmentId: 'shipment-1',
      orderItemId: 'orderitem-1',
      quantity: 2,
    },
    {
      id: 'shipmentitem-2',
      shipmentId: 'shipment-1',
      orderItemId: 'orderitem-2',
      quantity: 1,
    },
  ]);

  await db.insert(billingInvoice).values([
    {
      id: 'invoice-1001',
      accountId: 'acct-aurora',
      contactId: 'contact-alana',
      issuedById: '4',
      status: 'open',
      invoiceDate: '2024-05-16',
      dueDate: '2024-06-15',
      totalAmount: '22498.00',
      currency: 'USD',
    },
  ]);

  await db.insert(billingInvoiceLine).values([
    {
      id: 'invoiceline-1',
      invoiceId: 'invoice-1001',
      orderItemId: 'orderitem-1',
      description: 'Zero Workflows Enterprise Subscription',
      quantity: 2,
      unitPrice: '8999.00',
    },
    {
      id: 'invoiceline-2',
      invoiceId: 'invoice-1001',
      orderItemId: 'orderitem-2',
      description: 'Whiteglove Onboarding',
      quantity: 1,
      unitPrice: '4500.00',
    },
  ]);

  await db.insert(department).values([
    {
      id: 'dept-ops',
      name: 'Operations',
      description: 'Keeps the business running smoothly.',
      managerId: '1',
    },
    {
      id: 'dept-gtm',
      name: 'Go-To-Market',
      description: 'Marketing and sales alignment team.',
      managerId: '5',
    },
  ]);

  await db.insert(team).values([
    {
      id: 'team-ops',
      departmentId: 'dept-ops',
      leadId: '4',
      name: 'Ops Excellence',
    },
    {
      id: 'team-marketing',
      departmentId: 'dept-gtm',
      leadId: '5',
      name: 'Demand Gen',
    },
  ]);

  await db.insert(documentSharing).values([
    {
      id: 'share-brief-team',
      fileId: 'file-brief',
      sharedWithTeamId: 'team-ops',
      permission: 'edit',
    },
    {
      id: 'share-notes-james',
      fileId: 'file-notes',
      sharedWithUserId: '1',
      permission: 'view',
    },
    {
      id: 'share-notes-marketing',
      fileId: 'file-notes',
      sharedWithTeamId: 'team-marketing',
      permission: 'comment',
    },
  ]);

  await db.insert(employeeProfile).values([
    {
      id: 'employee-thomas',
      userId: '4',
      departmentId: 'dept-ops',
      teamId: 'team-ops',
      title: 'Director of Operations',
      startDate: '2021-04-12',
      employmentType: 'full_time',
    },
    {
      id: 'employee-priya',
      userId: '5',
      departmentId: 'dept-gtm',
      teamId: 'team-marketing',
      title: 'Head of Marketing',
      startDate: '2022-01-03',
      employmentType: 'full_time',
    },
    {
      id: 'employee-amelia',
      userId: '7',
      departmentId: 'dept-gtm',
      teamId: 'team-marketing',
      title: 'Campaign Manager',
      startDate: '2023-09-18',
      employmentType: 'contract',
    },
  ]);

  await db.insert(employmentHistory).values([
    {
      id: 'employment-thomas-1',
      employeeId: 'employee-thomas',
      company: 'Forward Logistics',
      title: 'Ops Manager',
      startDate: '2016-02-01',
      endDate: '2021-03-31',
    },
  ]);

  await db.insert(employeeDocument).values([
    {
      id: 'employeedoc-thomas-offer',
      employeeId: 'employee-thomas',
      fileName: 'thomas-offer-letter.pdf',
      documentType: 'offer_letter',
      uploadedById: '1',
    },
    {
      id: 'employeedoc-priya-cert',
      employeeId: 'employee-priya',
      fileName: 'priya-brand-certification.pdf',
      documentType: 'certification',
      uploadedById: '5',
    },
  ]);

  await db.insert(benefitPlan).values([
    {
      id: 'benefit-health',
      name: 'Comprehensive Health',
      provider: 'Wellness Co',
      description: 'Medical, dental, and vision coverage',
      administratorId: '1',
    },
  ]);

  await db.insert(benefitEnrollment).values([
    {
      id: 'benefitenroll-thomas',
      benefitPlanId: 'benefit-health',
      employeeId: 'employee-thomas',
      enrolledAt: new Date('2021-04-12T12:00:00Z'),
      coverageLevel: 'family',
    },
    {
      id: 'benefitenroll-priya',
      benefitPlanId: 'benefit-health',
      employeeId: 'employee-priya',
      enrolledAt: new Date('2022-01-03T12:00:00Z'),
      coverageLevel: 'individual',
    },
  ]);

  await db.insert(timesheet).values([
    {
      id: 'timesheet-thomas-week12',
      employeeId: 'employee-thomas',
      periodStart: '2024-03-04',
      periodEnd: '2024-03-10',
      submittedById: '4',
      status: 'submitted',
    },
    {
      id: 'timesheet-amelia-week12',
      employeeId: 'employee-amelia',
      periodStart: '2024-03-04',
      periodEnd: '2024-03-10',
      submittedById: '7',
      status: 'approved',
    },
  ]);

  await db.insert(timeEntry).values([
    {
      id: 'timeentry-thomas-1',
      timesheetId: 'timesheet-thomas-week12',
      taskId: 'task-automation',
      hours: '6.50',
      notes: 'Vendor coordination and integration planning.',
      entryDate: '2024-03-06',
    },
    {
      id: 'timeentry-amelia-1',
      timesheetId: 'timesheet-amelia-week12',
      taskId: 'task-launch-plan',
      hours: '4.00',
      notes: 'Prepared launch checklist draft.',
      entryDate: '2024-03-07',
    },
  ]);

  await db.insert(expenseReport).values([
    {
      id: 'expense-ops-travel',
      ownerId: '4',
      departmentId: 'dept-ops',
      status: 'submitted',
      submittedAt: new Date('2024-03-08T18:30:00Z'),
    },
  ]);

  await db.insert(expenseItem).values([
    {
      id: 'expenseitem-flight',
      reportId: 'expense-ops-travel',
      amount: '425.50',
      category: 'travel',
      incurredAt: '2024-03-02',
      merchant: 'Skyline Air',
      notes: 'Flight to customer onsite.',
    },
    {
      id: 'expenseitem-hotel',
      reportId: 'expense-ops-travel',
      amount: '612.75',
      category: 'lodging',
      incurredAt: '2024-03-04',
      merchant: 'City Center Hotel',
      notes: 'Three-night stay for onsite workshop.',
    },
  ]);

  await db.insert(ledgerAccount).values([
    {
      id: 'ledger-root',
      name: 'Root Account',
      code: '1000',
      accountType: 'equity',
    },
    {
      id: 'ledger-revenue',
      name: 'Revenue',
      code: '4000',
      accountType: 'revenue',
      parentAccountId: 'ledger-root',
    },
    {
      id: 'ledger-expense',
      name: 'Travel Expense',
      code: '6100',
      accountType: 'expense',
      parentAccountId: 'ledger-root',
    },
  ]);

  await db.insert(ledgerTransaction).values([
    {
      id: 'ledger-txn-1',
      reference: 'INV-1001',
      transactionDate: '2024-05-16',
      createdById: '4',
      description: 'Invoice posted for Aurora Manufacturing',
    },
  ]);

  await db.insert(ledgerEntry).values([
    {
      id: 'ledgerentry-1',
      transactionId: 'ledger-txn-1',
      accountId: 'ledger-revenue',
      credit: '22498.00',
      memo: 'Aurora invoice revenue',
    },
    {
      id: 'ledgerentry-2',
      transactionId: 'ledger-txn-1',
      accountId: 'ledger-expense',
      debit: '1038.25',
      memo: 'Travel expenses for onsite workshop',
    },
  ]);

  await db.insert(budget).values([
    {
      id: 'budget-ops-2024',
      departmentId: 'dept-ops',
      fiscalYear: 2024,
      totalAmount: '500000.00',
      currency: 'USD',
    },
  ]);

  await db.insert(budgetLine).values([
    {
      id: 'budgetline-ops-travel',
      budgetId: 'budget-ops-2024',
      accountId: 'ledger-expense',
      amount: '85000.00',
    },
  ]);

  await db.insert(supportTicket).values([
    {
      id: 'ticket-aurora-001',
      customerId: '3',
      assignedTeamId: 'team-ops',
      subject: 'Workflow sync delay',
      status: 'open',
      priority: 'high',
      source: 'email',
    },
  ]);

  await db.insert(supportTicketMessage).values([
    {
      id: 'ticketmsg-1',
      ticketId: 'ticket-aurora-001',
      authorId: '3',
      body: 'We are seeing delays in workflow replication for site B.',
      visibility: 'customer',
    },
    {
      id: 'ticketmsg-2',
      ticketId: 'ticket-aurora-001',
      authorId: '4',
      body: 'Investigating logs for site B. Will update within an hour.',
      visibility: 'internal',
    },
  ]);

  await db.insert(supportTicketTag).values([
    {
      id: 'tickettag-urgent',
      label: 'Urgent',
      description: 'Needs immediate attention',
    },
    {
      id: 'tickettag-sync',
      label: 'Sync',
      description: 'Replication or sync related',
    },
  ]);

  await db.insert(supportTicketTagLink).values([
    {
      id: 'tickettaglink-1',
      ticketId: 'ticket-aurora-001',
      tagId: 'tickettag-urgent',
    },
    {
      id: 'tickettaglink-2',
      ticketId: 'ticket-aurora-001',
      tagId: 'tickettag-sync',
    },
  ]);

  await db.insert(supportTicketAssignment).values([
    {
      id: 'ticketassign-1',
      ticketId: 'ticket-aurora-001',
      assigneeId: '6',
      assignedAt: new Date('2024-03-09T14:00:00Z'),
      assignmentType: 'primary',
    },
  ]);

  await db.insert(supportTicketAudit).values([
    {
      id: 'ticketaudit-1',
      ticketId: 'ticket-aurora-001',
      actorId: '4',
      action: 'STATUS_CHANGE',
      details: {from: 'new', to: 'open'},
    },
  ]);

  await db.insert(marketingCampaign).values([
    {
      id: 'campaign-q4',
      ownerId: '5',
      name: 'Q4 Launch',
      status: 'planning',
      startDate: '2024-09-01',
      endDate: '2024-12-15',
      budgetAmount: '120000.00',
    },
  ]);

  await db.insert(marketingChannel).values([
    {
      id: 'channel-email',
      name: 'Email',
      channelType: 'owned',
      costModel: 'per_send',
    },
    {
      id: 'channel-social',
      name: 'Paid Social',
      channelType: 'paid',
      costModel: 'cpm',
    },
  ]);

  await db.insert(marketingCampaignChannel).values([
    {
      id: 'campaignchannel-email',
      campaignId: 'campaign-q4',
      channelId: 'channel-email',
      allocation: '45000.00',
    },
    {
      id: 'campaignchannel-social',
      campaignId: 'campaign-q4',
      channelId: 'channel-social',
      allocation: '75000.00',
    },
  ]);

  await db.insert(marketingAudience).values([
    {
      id: 'audience-enterprise',
      name: 'Enterprise Ops Leaders',
      segmentType: 'dynamic',
      definition: {filters: ['industry:manufacturing', 'employees:500+']},
    },
  ]);

  await db.insert(marketingCampaignAudience).values([
    {
      id: 'campaignaudience-1',
      campaignId: 'campaign-q4',
      audienceId: 'audience-enterprise',
    },
  ]);

  await db.insert(analyticsDashboard).values([
    {
      id: 'dashboard-revenue',
      ownerId: '1',
      title: 'Revenue Pulse',
      description: 'Pipeline and bookings snapshot',
      defaultQuery: {
        dimensions: ['hour', 'day', 'week', 'month'],
        metrics: ['sum(amount)'],
        limit: 10,
        timezone: 'UTC',
        filters: [],
      },
    },
  ]);

  await db.insert(analyticsWidget).values([
    {
      id: 'widget-pipeline',
      dashboardId: 'dashboard-revenue',
      title: 'Pipeline by Stage',
      widgetType: 'bar',
      position: 1,
    },
    {
      id: 'widget-bookings',
      dashboardId: 'dashboard-revenue',
      title: 'Bookings Trend',
      widgetType: 'line',
      position: 2,
    },
  ]);

  await db.insert(analyticsWidgetQuery).values([
    {
      id: 'widgetquery-pipeline',
      widgetId: 'widget-pipeline',
      dataSource: 'warehouse',
      query: 'SELECT stage, sum(amount) FROM pipeline GROUP BY stage',
      refreshIntervalSeconds: 900,
    },
    {
      id: 'widgetquery-bookings',
      widgetId: 'widget-bookings',
      dataSource: 'warehouse',
      query: 'SELECT close_date, sum(amount) FROM bookings GROUP BY close_date',
      refreshIntervalSeconds: 1800,
    },
  ]);

  await db.insert(integrationWebhook).values([
    {
      id: 'webhook-ops',
      projectId: 'project-ops',
      accountId: 'acct-aurora',
      name: 'Ops Sync',
      url: 'https://hooks.example.com/ops-sync',
      secret: 'secret-ops',
      isActive: true,
    },
  ]);

  await db.insert(integrationEvent).values([
    {
      id: 'event-ops-1',
      webhookId: 'webhook-ops',
      payload: {orderId: 'order-1001', status: 'processing'},
      eventType: 'order.updated',
      deliveredAt: new Date('2024-05-20T08:05:00Z'),
      status: 'delivered',
    },
  ]);

  await db.insert(integrationCredential).values([
    {
      id: 'credential-ops',
      webhookId: 'webhook-ops',
      provider: 'OpsBridge',
      clientId: 'ops-client',
      clientSecret: 'ops-secret',
      metadata: {scopes: ['orders:read', 'orders:write']},
    },
  ]);

  await db.insert(allTypes).values({
    id: '1',
    smallintField: 1,
    integerField: 2,
    bigintField: 95807n,
    bigintNumberField: 444,
    smallSerialField: 1,
    serialField: 1,
    bigSerialField: 1,
    numericField: '8.8',
    decimalField: '9.9',
    realField: 10.8,
    doublePrecisionField: 11.9,
    textField: 'text',
    charField: 'c',
    uuidField: '123e4567-e89b-12d3-a456-426614174000',
    varcharField: 'varchar',
    booleanField: true,
    timestampField: new Date(),
    timestampTzField: new Date(),
    timestampModeString: new Date().toISOString(),
    timestampModeDate: new Date(),
    dateField: new Date().toISOString(),
    jsonField: {key: 'value'},
    jsonbField: {key: 'value'},
    typedJsonField: {theme: 'light', fontSize: 16},
    status: 'pending',
    textArray: ['text', 'text2'],
    intArray: [1, 2],
    // boolArray: [true, false],
    numericArray: [8.8, 9.9],
    uuidArray: [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
    jsonbArray: [{key: 'value'}, {key: 'value2'}],
    enumArray: ['pending', 'active'],
    optionalSmallint: 5,
    optionalInteger: 99,
    optionalBigint: 12345,
    optionalNumeric: '5.50',
    optionalReal: 2.5,
    optionalDoublePrecision: 15.75,
    optionalText: 'optional text',
    optionalBoolean: false,
    optionalTimestamp: new Date(),
    optionalJson: {info: 'optional'},
    optionalEnum: 'active',
    optionalVarchar: 'optional',
    optionalUuid: '123e4567-e89b-12d3-a456-426614174099',
  });

  await db.insert(friendship).values({
    requestingId: '1',
    acceptingId: '2',
    accepted: true,
  });
};

export const shutdown = async () => {
  try {
    await pool.end();
    await zeroContainer?.stop({remove: true});
    await postgresContainer?.stop({remove: true});
    await startedNetwork?.stop();
  } catch {}
};

export const startPostgres = async () => {
  startedNetwork = await new Network().start();

  // Start PostgreSQL container
  postgresContainer = await new PostgreSqlContainer(
    `postgres:${process.env.PG_VERSION ?? '16'}`,
  )
    .withDatabase('drizzle_zero')
    .withUsername('user')
    .withPassword('password')
    .withNetwork(startedNetwork)
    .withNetworkAliases('postgres-db')
    .withExposedPorts({
      container: 5432,
      host: PG_PORT,
    })
    .withCommand([
      'postgres',
      '-c',
      'wal_level=logical',
      '-c',
      'max_wal_senders=10',
      '-c',
      'max_replication_slots=5',
      '-c',
      'hot_standby=on',
      '-c',
      'hot_standby_feedback=on',
    ])
    .withCopyDirectoriesToContainer([
      {
        source: path.join(__dirname, './drizzle'),
        target: '/docker-entrypoint-initdb.d',
      },
    ])
    .withPullPolicy(PullPolicy.alwaysPull())
    .start();

  return {
    postgresContainer,
  };
};

export const startZero = async (options: {getQueriesUrl: string}) => {
  if (!startedNetwork || !postgresContainer) {
    throw new Error('Network or postgres container not started');
  }

  const basePgUrl = `postgresql://${postgresContainer.getUsername()}:${postgresContainer.getPassword()}`;
  const basePgUrlWithInternalPort = `${basePgUrl}@postgres-db:5432`;

  // Start Zero container
  zeroContainer = await new GenericContainer(`rocicorp/zero:latest`)
    .withExposedPorts({
      container: 4848,
      host: ZERO_PORT,
    })
    .withNetwork(startedNetwork)
    .withEnvironment({
      ZERO_UPSTREAM_DB: `${basePgUrlWithInternalPort}/drizzle_zero`,
      ZERO_AUTH_SECRET: 'secretkey',
      ZERO_REPLICA_FILE: '/zero.db',
      ZERO_NUM_SYNC_WORKERS: '1',
      ZERO_ADMIN_PASSWORD: 'password',
      ZERO_GET_QUERIES_URL: options.getQueriesUrl,
    })
    .withExtraHosts([{host: 'host.docker.internal', ipAddress: 'host-gateway'}])
    .withStartupTimeout(60000)
    .withPullPolicy(PullPolicy.alwaysPull())
    .start();

  return {
    zeroContainer,
  };
};

export const startPostgresAndZero = async (options: {
  getQueriesUrl: string;
}) => {
  const {postgresContainer} = await startPostgres();
  const {zeroContainer} = await startZero(options);

  await seed();

  return {
    postgresContainer,
    zeroContainer,
  };
};
