import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import path from "path";
import { Pool } from "pg";
import postgres from "postgres";
import {
  GenericContainer,
  Network,
  PullPolicy,
  StartedNetwork,
  type StartedTestContainer,
} from "testcontainers";
import { getShortCode } from "./drizzle/types";
import * as drizzleSchema from "./schema";
import {
  allTypes,
  analyticsDashboard,
  analyticsWidget,
  analyticsWidgetQuery,
  apInvoice,
  apVendor,
  arCustomer,
  arInvoice,
  bankAccount,
  bankTransaction,
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
  crmLead,
  crmLeadActivity,
  crmLeadSource,
  crmNote,
  crmOpportunity,
  crmOpportunityStageHistory,
  crmPipelineStage,
  crmSalesSequence,
  crmSalesSequenceStep,
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
  hrDepartment,
  hrEmployee,
  hrTimeOffPolicy,
  hrTimeOffRequest,
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
  productCatalog,
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
  // New tables
  workspace,
  workspaceApiKey,
  workspaceMembership,
} from "./schema";

const versionInt = parseInt(process.env.PG_VERSION ?? "16");
const PG_PORT = 5732 + (versionInt - 16);
export const ZERO_PORT = 5949 + (versionInt - 16);

export const pool = new Pool({
  host: "localhost",
  port: PG_PORT,
  user: "user",
  password: "password",
  database: "drizzle_zero",
});

export const postgresJsClient = postgres(
  `postgres://user:password@localhost:${PG_PORT}/drizzle_zero`,
);

let startedNetwork: StartedNetwork | null = null;
let postgresContainer: StartedPostgreSqlContainer | null = null;
let zeroContainer: StartedTestContainer | null = null;

export const db: NodePgDatabase<typeof drizzleSchema> = drizzle(pool, {
  schema: drizzleSchema,
});

export const seed = async () => {
  await db.insert(workspace).values([
    {
      id: "workspace_1",
      name: "Acme Corporation",
      slug: "acme-corp",
      subscriptionTier: "enterprise",
      billingEmail: "billing@acme.com",
      settings: { theme: "dark", notifications: true },
    },
    {
      id: "workspace_2",
      name: "TechStart Inc",
      slug: "techstart",
      subscriptionTier: "pro",
      billingEmail: "admin@techstart.com",
      settings: { theme: "light", notifications: false },
    },
  ]);

  await db
    .insert(medium)
    .values({ workspaceId: "workspace_1", id: "1", name: "email" });
  await db
    .insert(medium)
    .values({ workspaceId: "workspace_1", id: "2", name: "teams" });
  await db
    .insert(medium)
    .values({ workspaceId: "workspace_1", id: "3", name: "sms" });
  await db
    .insert(medium)
    .values({ workspaceId: "workspace_1", id: "4", name: "whatsapp" });

  await db
    .insert(filters)
    .values({ workspaceId: "workspace_1", id: "1", name: "filter1" });
  await db.insert(filters).values({
    workspaceId: "workspace_1",
    id: "2",
    name: "filter2",
    parentId: "1",
  });
  await db.insert(filters).values({
    workspaceId: "workspace_1",
    id: "3",
    name: "filter3",
    parentId: "1",
  });

  await db.insert(user).values({
    workspaceId: "workspace_1",
    id: "1",
    name: "James",
    partner: true,
    email: "james@example.com",
    customTypeJson: {
      id: "1",
      custom: "this-is-imported-from-custom-types",
    },
    customInterfaceJson: {
      custom: "this-interface-is-imported-from-custom-types",
    },
    testInterface: {
      nameInterface: "custom-inline-interface",
    },
    testType: {
      nameType: "custom-inline-type",
    },
    testExportedType: {
      nameType: "custom-inline-type",
    },
    status: "COMPLETED",
    notificationPreferences: [
      {
        channel: "email",
        address: "james@example.com",
        templateId: "template-1",
      },
    ],
    countryIso: "US",
    preferredCurrency: "USD",
    regionCode: "CA",
  });
  await db.insert(user).values({
    workspaceId: "workspace_1",
    id: "2",
    name: "John",
    partner: false,
    email: "john@example.com",
    customTypeJson: {
      id: "2",
      custom: "this-is-imported-from-custom-types",
    },
    customInterfaceJson: {
      custom: "this-interface-is-imported-from-custom-types",
    },
    testInterface: {
      nameInterface: "custom-inline-interface",
    },
    testType: {
      nameType: "custom-inline-type",
    },
    testExportedType: {
      nameType: "custom-inline-type",
    },
    notificationPreferences: [
      {
        channel: "email",
        address: "john@example.com",
        templateId: "template-1",
      },
    ],
    countryIso: "US",
    preferredCurrency: "USD",
    regionCode: "CA",
  });
  await db.insert(user).values({
    workspaceId: "workspace_1",
    id: "3",
    name: "Jane",
    partner: false,
    email: "jane@example.com",
    customTypeJson: {
      id: "3",
      custom: "this-is-imported-from-custom-types",
    },
    customInterfaceJson: {
      custom: "this-interface-is-imported-from-custom-types",
    },
    testInterface: {
      nameInterface: "custom-inline-interface",
    },
    testType: {
      nameType: "custom-inline-type",
    },
    testExportedType: {
      nameType: "custom-inline-type",
    },
    status: "ASSIGNED",
    notificationPreferences: [
      {
        channel: "email",
        address: "jane@example.com",
        templateId: "template-1",
      },
    ],
    countryIso: "US",
    preferredCurrency: "USD",
    regionCode: "CA",
  });

  await db.insert(message).values({
    workspaceId: "workspace_1",
    id: "1",
    body: "Hey, James!",
    senderId: "1",
    mediumId: "1",
    metadata: { key: "value1" },
  });

  await db.insert(message).values({
    workspaceId: "workspace_1",
    id: "2",
    body: "Hello on Teams",
    senderId: "2",
    mediumId: "2",
    metadata: { key: "value2" },
  });

  await db.insert(message).values({
    workspaceId: "workspace_1",
    id: "3",
    body: "SMS message here",
    senderId: "3",
    mediumId: "3",
    metadata: { key: "value3" },
  });

  await db.insert(message).values({
    workspaceId: "workspace_1",
    id: "4",
    body: "WhatsApp message",
    senderId: "2",
    mediumId: "4",
    metadata: { key: "value4" },
  });

  await db.insert(message).values({
    workspaceId: "workspace_1",
    id: "5",
    body: "Thomas!",
    senderId: "1",
    mediumId: "4",
    metadata: { key: "value5" },
  });

  await db.insert(user).values([
    {
      workspaceId: "workspace_1",
      id: "4",
      name: "Thomas",
      partner: true,
      email: "thomas@example.com",
      customTypeJson: {
        id: "4",
        custom: "this-is-imported-from-custom-types",
      },
      customInterfaceJson: {
        custom: "this-interface-is-imported-from-custom-types",
      },
      testInterface: {
        nameInterface: "custom-inline-interface",
      },
      testType: {
        nameType: "custom-inline-type",
      },
      testExportedType: {
        nameType: "custom-inline-type",
      },
      status: "COMPLETED",
      notificationPreferences: [
        {
          channel: "email",
          address: "thomas@example.com",
          templateId: "template-1",
        },
      ],
      countryIso: "US",
      preferredCurrency: "USD",
      regionCode: "CA",
    },
    {
      workspaceId: "workspace_1",
      id: "5",
      name: "Priya",
      partner: true,
      email: "priya@example.com",
      customTypeJson: {
        id: "5",
        custom: "this-is-imported-from-custom-types",
      },
      customInterfaceJson: {
        custom: "this-interface-is-imported-from-custom-types",
      },
      testInterface: {
        nameInterface: "custom-inline-interface",
      },
      testType: {
        nameType: "custom-inline-type",
      },
      testExportedType: {
        nameType: "custom-inline-type",
      },
      status: "COMPLETED",
      notificationPreferences: [
        {
          channel: "email",
          address: "priya@example.com",
          templateId: "template-1",
        },
      ],
      countryIso: "US",
      preferredCurrency: "USD",
      regionCode: "CA",
    },
    {
      workspaceId: "workspace_1",
      id: "6",
      name: "Liu",
      partner: false,
      email: "liu@example.com",
      customTypeJson: {
        id: "6",
        custom: "this-is-imported-from-custom-types",
      },
      customInterfaceJson: {
        custom: "this-interface-is-imported-from-custom-types",
      },
      testInterface: {
        nameInterface: "custom-inline-interface",
      },
      testType: {
        nameType: "custom-inline-type",
      },
      testExportedType: {
        nameType: "custom-inline-type",
      },
      status: "ASSIGNED",
      notificationPreferences: [
        {
          channel: "email",
          address: "liu@example.com",
          templateId: "template-1",
        },
      ],
      countryIso: "US",
      preferredCurrency: "USD",
      regionCode: "CA",
    },
    {
      workspaceId: "workspace_1",
      id: "7",
      name: "Amelia",
      partner: false,
      email: "amelia@example.com",
      customTypeJson: {
        id: "7",
        custom: "this-is-imported-from-custom-types",
      },
      customInterfaceJson: {
        custom: "this-interface-is-imported-from-custom-types",
      },
      testInterface: {
        nameInterface: "custom-inline-interface",
      },
      testType: {
        nameType: "custom-inline-type",
      },
      testExportedType: {
        nameType: "custom-inline-type",
      },
      status: "ASSIGNED",
      notificationPreferences: [
        {
          channel: "email",
          address: "amelia@example.com",
          templateId: "template-1",
        },
      ],
      countryIso: "US",
      preferredCurrency: "USD",
      regionCode: "CA",
    },
  ]);

  await db.insert(message).values([
    {
      workspaceId: "workspace_1",
      id: "6",
      body: "Looping in the ops team now.",
      senderId: "4",
      mediumId: "1",
      metadata: { key: "value6" },
    },
    {
      workspaceId: "workspace_1",
      id: "7",
      body: "Weekly sync invite sent.",
      senderId: "5",
      mediumId: "2",
      metadata: { key: "value7" },
    },
    {
      workspaceId: "workspace_1",
      id: "8",
      body: "Inventory alert triggered.",
      senderId: "6",
      mediumId: "3",
      metadata: { key: "value8" },
    },
    {
      workspaceId: "workspace_1",
      id: "9",
      body: "Design mockups ready for review.",
      senderId: "7",
      mediumId: "4",
      metadata: { key: "value9" },
    },
  ]);

  await db.insert(projectTag).values([
    {
      workspaceId: "workspace_1",
      id: "project-tag-design",
      label: "Design",
      color: "#FF8A65",
    },
    {
      workspaceId: "workspace_1",
      id: "project-tag-backlog",
      label: "Backlog",
      color: "#4DB6AC",
    },
    {
      workspaceId: "workspace_1",
      id: "project-tag-customer",
      label: "Customer",
      color: "#9575CD",
    },
  ]);

  await db.insert(project).values([
    {
      workspaceId: "workspace_1",
      id: "project-ops",
      ownerId: "4",
      name: "Operations Platform Revamp",
      description: "Consolidate tooling for ops and customer success.",
      status: "in_progress",
      workflowState: {
        state: "scheduled",
        updatedBy: "4",
        runAtIso: new Date().toISOString(),
      },
    },
    {
      workspaceId: "workspace_1",
      id: "project-marketing",
      ownerId: "5",
      name: "Marketing Launch Q4",
      description: "Coordinated launch campaign for Q4 initiatives.",
      status: "planning",
      workflowState: {
        state: "failed",
        failedAtIso: new Date().toISOString(),
        reason: "Failed to launch campaign",
        retryable: true,
      },
    },
  ]);

  await db.insert(projectPhase).values([
    {
      workspaceId: "workspace_1",
      id: "phase-discovery",
      projectId: "project-ops",
      name: "Discovery",
      sequence: 1,
    },
    {
      workspaceId: "workspace_1",
      id: "phase-build",
      projectId: "project-ops",
      name: "Build",
      sequence: 2,
    },
    {
      workspaceId: "workspace_1",
      id: "phase-launch",
      projectId: "project-marketing",
      name: "Launch",
      sequence: 1,
    },
  ]);

  await db.insert(projectTask).values([
    {
      workspaceId: "workspace_1",
      id: "task-user-research",
      projectId: "project-ops",
      phaseId: "phase-discovery",
      title: "Interview frontline teams",
      status: "in_progress",
      priority: "high",
    },
    {
      workspaceId: "workspace_1",
      id: "task-automation",
      projectId: "project-ops",
      phaseId: "phase-build",
      title: "Automate onboarding workflow",
      status: "blocked",
      priority: "critical",
    },
    {
      workspaceId: "workspace_1",
      id: "task-launch-plan",
      projectId: "project-marketing",
      phaseId: "phase-launch",
      title: "Publish launch day checklist",
      status: "todo",
      priority: "medium",
    },
  ]);

  await db.insert(projectAssignment).values([
    {
      workspaceId: "workspace_1",
      id: "assignment-1",
      taskId: "task-user-research",
      userId: "5",
      assignedAt: new Date("2024-03-01T09:00:00Z"),
      role: "Research Lead",
    },
    {
      workspaceId: "workspace_1",
      id: "assignment-2",
      taskId: "task-automation",
      userId: "6",
      assignedAt: new Date("2024-03-05T10:30:00Z"),
      role: "Automation Engineer",
    },
    {
      workspaceId: "workspace_1",
      id: "assignment-3",
      taskId: "task-launch-plan",
      userId: "7",
      assignedAt: new Date("2024-03-07T15:15:00Z"),
      role: "Campaign Coordinator",
    },
  ]);

  await db.insert(projectComment).values([
    {
      workspaceId: "workspace_1",
      id: "comment-1",
      taskId: "task-user-research",
      authorId: "5",
      body: "User interviews scheduled for next Tuesday.",
    },
    {
      workspaceId: "workspace_1",
      id: "comment-2",
      taskId: "task-automation",
      authorId: "6",
      body: "Waiting on API credentials from the vendor.",
    },
  ]);

  await db.insert(projectAttachment).values([
    {
      workspaceId: "workspace_1",
      id: "attachment-1",
      taskId: "task-user-research",
      fileName: "interview-script.docx",
      fileType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    {
      workspaceId: "workspace_1",
      id: "attachment-2",
      taskId: "task-automation",
      fileName: "workflow-diagram.png",
      fileType: "image/png",
    },
  ]);

  await db.insert(projectTaskTag).values([
    {
      workspaceId: "workspace_1",
      id: "tasktag-1",
      taskId: "task-user-research",
      tagId: "project-tag-customer",
    },
    {
      workspaceId: "workspace_1",
      id: "tasktag-2",
      taskId: "task-automation",
      tagId: "project-tag-backlog",
    },
    {
      workspaceId: "workspace_1",
      id: "tasktag-3",
      taskId: "task-launch-plan",
      tagId: "project-tag-design",
    },
  ]);

  await db.insert(projectNote).values([
    {
      workspaceId: "workspace_1",
      id: "project-note-1",
      projectId: "project-ops",
      authorId: "4",
      note: "Ops revamp aligns with Q3 retention goals.",
    },
    {
      workspaceId: "workspace_1",
      id: "project-note-2",
      projectId: "project-marketing",
      authorId: "5",
      note: "Coordinate launch with CRM opportunity milestones.",
    },
  ]);

  await db.insert(projectAudit).values([
    {
      workspaceId: "workspace_1",
      id: "project-audit-1",
      projectId: "project-ops",
      actorId: "4",
      action: "STATUS_CHANGE",
      details: [
        {
          severity: "info",
          detectedAtIso: new Date().toISOString(),
          diffs: [{ op: "set", path: "status", value: "in_progress" }],
        },
      ],
    },
    {
      workspaceId: "workspace_1",
      id: "project-audit-2",
      projectId: "project-marketing",
      actorId: "5",
      action: "PHASE_ADDED",
      details: [
        {
          severity: "info",
          detectedAtIso: new Date().toISOString(),
          diffs: [{ op: "set", path: "phaseId", value: "phase-launch" }],
        },
      ],
    },
  ]);

  await db.insert(documentLibrary).values([
    {
      workspaceId: "workspace_1",
      id: "library-ops",
      projectId: "project-ops",
      name: "Ops Shared Docs",
      description: "Documentation for the ops revamp program.",
      visibility: "team",
    },
  ]);

  await db.insert(documentFolder).values([
    {
      workspaceId: "workspace_1",
      id: "folder-root",
      libraryId: "library-ops",
      name: "Root",
    },
    {
      workspaceId: "workspace_1",
      id: "folder-research",
      libraryId: "library-ops",
      parentId: "folder-root",
      name: "Research",
    },
  ]);

  await db.insert(documentFile).values([
    {
      workspaceId: "workspace_1",
      id: "file-brief",
      folderId: "folder-root",
      uploadedById: "4",
      fileName: "program-brief.pdf",
      mimeType: "application/pdf",
      sizeBytes: 524288,
      version: 1,
    },
    {
      workspaceId: "workspace_1",
      id: "file-notes",
      folderId: "folder-research",
      uploadedById: "5",
      fileName: "interview-notes.txt",
      mimeType: "text/plain",
      sizeBytes: 20480,
      version: 2,
    },
  ]);

  await db.insert(documentFileVersion).values([
    {
      workspaceId: "workspace_1",
      id: "filever-brief-1",
      fileId: "file-brief",
      uploadedById: "4",
      version: 1,
      changeLog: "Initial draft of the program brief.",
      fileSizeBytes: 524288,
    },
    {
      workspaceId: "workspace_1",
      id: "filever-notes-2",
      fileId: "file-notes",
      uploadedById: "5",
      version: 2,
      changeLog: "Added insights from customer interviews.",
      fileSizeBytes: 20480,
    },
  ]);

  await db.insert(crmAccount).values([
    {
      workspaceId: "workspace_1",
      id: "acct-aurora",
      ownerId: "1",
      name: "Aurora Manufacturing",
      industry: "Manufacturing",
      status: "active",
    },
    {
      workspaceId: "workspace_1",
      id: "acct-lumen",
      ownerId: "5",
      name: "Lumen Retail Group",
      industry: "Retail",
      status: "prospect",
    },
  ]);

  await db.insert(crmContact).values([
    {
      workspaceId: "workspace_1",
      id: "contact-alana",
      accountId: "acct-aurora",
      firstName: "Alana",
      lastName: "Murphy",
      email: "alana.murphy@aurora.example.com",
      phone: "+1-555-0142",
    },
    {
      workspaceId: "workspace_1",
      id: "contact-ravi",
      accountId: "acct-lumen",
      firstName: "Ravi",
      lastName: "Singh",
      email: "ravi.singh@lumen.example.com",
      phone: "+1-555-2377",
    },
  ]);

  await db.insert(crmPipelineStage).values([
    {
      workspaceId: "workspace_1",
      id: "stage-qualify",
      name: "Qualification",
      sequence: 1,
      probability: 20,
    },
    {
      workspaceId: "workspace_1",
      id: "stage-proposal",
      name: "Proposal",
      sequence: 2,
      probability: 45,
    },
    {
      workspaceId: "workspace_1",
      id: "stage-negotiation",
      name: "Negotiation",
      sequence: 3,
      probability: 70,
    },
  ]);

  await db.insert(crmOpportunity).values([
    {
      workspaceId: "workspace_1",
      id: "opp-aurora-platform",
      accountId: "acct-aurora",
      stageId: "stage-proposal",
      name: "Aurora Ops Platform",
      amount: "180000.00",
      closeDate: "2024-06-30",
    },
  ]);

  await db.insert(crmOpportunityStageHistory).values([
    {
      workspaceId: "workspace_1",
      id: "opp-stagehist-1",
      opportunityId: "opp-aurora-platform",
      stageId: "stage-qualify",
      changedById: "1",
    },
    {
      workspaceId: "workspace_1",
      id: "opp-stagehist-2",
      opportunityId: "opp-aurora-platform",
      stageId: "stage-proposal",
      changedById: "4",
    },
  ]);

  await db.insert(crmActivityType).values([
    {
      workspaceId: "workspace_1",
      id: "activity-call",
      name: "Call",
      description: "Phone or VoIP conversations.",
    },
    {
      workspaceId: "workspace_1",
      id: "activity-demo",
      name: "Product Demo",
      description: "Live product walkthrough.",
    },
  ]);

  await db.insert(crmActivity).values([
    {
      workspaceId: "workspace_1",
      id: "activity-1",
      accountId: "acct-aurora",
      contactId: "contact-alana",
      opportunityId: "opp-aurora-platform",
      typeId: "activity-call",
      performedById: "7",
      notes: "Discussed integration requirements and security posture.",
    },
    {
      workspaceId: "workspace_1",
      id: "activity-2",
      accountId: "acct-lumen",
      contactId: "contact-ravi",
      typeId: "activity-demo",
      performedById: "5",
      notes: "Introduced marketing automation capabilities.",
    },
  ]);

  await db.insert(crmNote).values([
    {
      workspaceId: "workspace_1",
      id: "crm-note-aurora",
      accountId: "acct-aurora",
      contactId: "contact-alana",
      authorId: "1",
      body: "Alana is focused on uptime and auditability.",
    },
  ]);

  await db.insert(productCategory).values([
    {
      workspaceId: "workspace_1",
      id: "cat-platform",
      name: "Platform",
      description: "Core SaaS platform modules",
    },
    {
      workspaceId: "workspace_1",
      id: "cat-services",
      name: "Services",
      description: "Professional services and onboarding",
    },
  ]);

  await db.insert(product).values([
    {
      workspaceId: "workspace_1",
      id: "product-zero",
      categoryId: "cat-platform",
      name: "Zero Workflows",
      description: "Workflow automation subscription",
      status: "active",
    },
    {
      workspaceId: "workspace_1",
      id: "product-onboarding",
      categoryId: "cat-services",
      name: "Whiteglove Onboarding",
      description: "Implementation and training package",
      status: "active",
    },
  ]);

  await db.insert(productVariant).values([
    {
      workspaceId: "workspace_1",
      id: "variant-zero-enterprise",
      productId: "product-zero",
      sku: "ZERO-ENT-12",
      price: "8999.00",
      currency: "USD",
      isActive: true,
    },
    {
      workspaceId: "workspace_1",
      id: "variant-onboarding-std",
      productId: "product-onboarding",
      sku: "SERV-ONB-01",
      price: "4500.00",
      currency: "USD",
      isActive: true,
    },
  ]);

  await db.insert(productMedia).values([
    {
      workspaceId: "workspace_1",
      id: "media-zero",
      productId: "product-zero",
      url: "https://cdn.example.com/products/zero-workflows/overview.png",
      type: getShortCode("image"),
      mimeKey: "png",
      mimeDescriptor: {
        mime_type: "image/png",
        group: "image",
        description: "PNG image",
        extensions: ["png"],
        is_text: false,
      },
    },
    {
      workspaceId: "workspace_1",
      id: "media-onboarding",
      productId: "product-onboarding",
      url: "https://cdn.example.com/products/onboarding/guide.pdf",
      type: getShortCode("document"),
      mimeKey: "pdf",
      mimeDescriptor: {
        mime_type: "application/pdf",
        group: "document",
        description: "PDF document",
        extensions: ["pdf"],
        is_text: false,
      },
    },
  ]);

  await db.insert(inventoryLocation).values([
    {
      workspaceId: "workspace_1",
      id: "inventory-remote",
      name: "Remote Delivery",
      address: "123 Cloud Way",
      region: "Global",
    },
  ]);

  await db.insert(inventoryLevel).values([
    {
      workspaceId: "workspace_1",
      id: "inventorylevel-zero",
      locationId: "inventory-remote",
      variantId: "variant-zero-enterprise",
      quantity: 50,
      reserved: 5,
    },
    {
      workspaceId: "workspace_1",
      id: "inventorylevel-onboarding",
      locationId: "inventory-remote",
      variantId: "variant-onboarding-std",
      quantity: 20,
      reserved: 2,
    },
  ]);

  await db.insert(inventoryItem).values([
    {
      workspaceId: "workspace_1",
      id: "inventoryitem-zero-001",
      variantId: "variant-zero-enterprise",
      serialNumber: "ZERO-ENT-001",
      metadata: { licenseSeats: 500 },
    },
  ]);

  await db.insert(orderTable).values([
    {
      workspaceId: "workspace_1",
      id: "order-1001",
      customerId: "2",
      opportunityId: "opp-aurora-platform",
      status: "processing",
      total: "22498.00",
      currency: "AFN",
      currencyMetadata: {
        code: "AFN",
        number: "971",
        digits: 2,
        currency: "Afghani",
        countries: ["AFG"],
      },
      billingCountryIso: "AF",
      shippingCountryIso: "AF",
    },
  ]);

  await db.insert(orderItem).values([
    {
      workspaceId: "workspace_1",
      id: "orderitem-1",
      orderId: "order-1001",
      variantId: "variant-zero-enterprise",
      quantity: 2,
      unitPrice: "8999.00",
    },
    {
      workspaceId: "workspace_1",
      id: "orderitem-2",
      orderId: "order-1001",
      variantId: "variant-onboarding-std",
      quantity: 1,
      unitPrice: "4500.00",
    },
  ]);

  await db.insert(payment).values([
    {
      workspaceId: "workspace_1",
      id: "payment-1",
      externalRef: "PAY-789",
      status: "captured",
      amount: "15000.00",
      currency: "USD",
      receivedAt: new Date("2024-05-15T12:00:00Z"),
      receivedById: "4",
    },
    {
      workspaceId: "workspace_1",
      id: "payment-2",
      externalRef: "PAY-790",
      status: "pending",
      amount: "7498.00",
      currency: "USD",
      receivedById: "4",
    },
  ]);

  await db.insert(orderPayment).values([
    {
      workspaceId: "workspace_1",
      id: "orderpayment-1",
      orderId: "order-1001",
      paymentId: "payment-1",
      amount: "15000.00",
      status: "captured",
    },
    {
      workspaceId: "workspace_1",
      id: "orderpayment-2",
      orderId: "order-1001",
      paymentId: "payment-2",
      amount: "7498.00",
      status: "pending",
    },
  ]);

  await db.insert(shipment).values([
    {
      workspaceId: "workspace_1",
      id: "shipment-1",
      orderId: "order-1001",
      shippedAt: new Date("2024-05-20T08:00:00Z"),
      carrier: "Digital Delivery",
      trackingNumber: "DD-2024-1001",
      destinationCountry: "AF",
      destinationState: "DC",
    },
  ]);

  await db.insert(shipmentItem).values([
    {
      workspaceId: "workspace_1",
      id: "shipmentitem-1",
      shipmentId: "shipment-1",
      orderItemId: "orderitem-1",
      quantity: 2,
    },
    {
      workspaceId: "workspace_1",
      id: "shipmentitem-2",
      shipmentId: "shipment-1",
      orderItemId: "orderitem-2",
      quantity: 1,
    },
  ]);

  await db.insert(billingInvoice).values([
    {
      workspaceId: "workspace_1",
      id: "invoice-1001",
      accountId: "acct-aurora",
      contactId: "contact-alana",
      issuedById: "4",
      status: "open",
      invoiceDate: "2024-05-16",
      dueDate: "2024-06-15",
      totalAmount: "22498.00",
      currency: "USD",
    },
  ]);

  await db.insert(billingInvoiceLine).values([
    {
      workspaceId: "workspace_1",
      id: "invoiceline-1",
      invoiceId: "invoice-1001",
      orderItemId: "orderitem-1",
      description: "Zero Workflows Enterprise Subscription",
      quantity: 2,
      unitPrice: "8999.00",
    },
    {
      workspaceId: "workspace_1",
      id: "invoiceline-2",
      invoiceId: "invoice-1001",
      orderItemId: "orderitem-2",
      description: "Whiteglove Onboarding",
      quantity: 1,
      unitPrice: "4500.00",
    },
  ]);

  await db.insert(department).values([
    {
      workspaceId: "workspace_1",
      id: "dept-ops",
      name: "Operations",
      description: "Keeps the business running smoothly.",
      managerId: "1",
    },
    {
      workspaceId: "workspace_1",
      id: "dept-gtm",
      name: "Go-To-Market",
      description: "Marketing and sales alignment team.",
      managerId: "5",
    },
  ]);

  await db.insert(team).values([
    {
      workspaceId: "workspace_1",
      id: "team-ops",
      departmentId: "dept-ops",
      leadId: "4",
      name: "Ops Excellence",
    },
    {
      workspaceId: "workspace_1",
      id: "team-marketing",
      departmentId: "dept-gtm",
      leadId: "5",
      name: "Demand Gen",
    },
  ]);

  await db.insert(documentSharing).values([
    {
      workspaceId: "workspace_1",
      id: "share-brief-team",
      fileId: "file-brief",
      sharedWithTeamId: "team-ops",
      permission: "edit",
    },
    {
      workspaceId: "workspace_1",
      id: "share-notes-james",
      fileId: "file-notes",
      sharedWithUserId: "1",
      permission: "view",
    },
    {
      workspaceId: "workspace_1",
      id: "share-notes-marketing",
      fileId: "file-notes",
      sharedWithTeamId: "team-marketing",
      permission: "comment",
    },
  ]);

  await db.insert(employeeProfile).values([
    {
      workspaceId: "workspace_1",
      id: "employee-thomas",
      userId: "4",
      departmentId: "dept-ops",
      teamId: "team-ops",
      title: "Director of Operations",
      startDate: "2021-04-12",
      employmentType: "full_time",
    },
    {
      workspaceId: "workspace_1",
      id: "employee-priya",
      userId: "5",
      departmentId: "dept-gtm",
      teamId: "team-marketing",
      title: "Head of Marketing",
      startDate: "2022-01-03",
      employmentType: "full_time",
    },
    {
      workspaceId: "workspace_1",
      id: "employee-amelia",
      userId: "7",
      departmentId: "dept-gtm",
      teamId: "team-marketing",
      title: "Campaign Manager",
      startDate: "2023-09-18",
      employmentType: "contract",
    },
  ]);

  await db.insert(employmentHistory).values([
    {
      workspaceId: "workspace_1",
      id: "employment-thomas-1",
      employeeId: "employee-thomas",
      company: "Forward Logistics",
      title: "Ops Manager",
      startDate: "2016-02-01",
      endDate: "2021-03-31",
    },
  ]);

  await db.insert(employeeDocument).values([
    {
      workspaceId: "workspace_1",
      id: "employeedoc-thomas-offer",
      employeeId: "employee-thomas",
      fileName: "thomas-offer-letter.pdf",
      documentType: "offer_letter",
      uploadedById: "1",
    },
    {
      workspaceId: "workspace_1",
      id: "employeedoc-priya-cert",
      employeeId: "employee-priya",
      fileName: "priya-brand-certification.pdf",
      documentType: "certification",
      uploadedById: "5",
    },
  ]);

  await db.insert(benefitPlan).values([
    {
      workspaceId: "workspace_1",
      id: "benefit-health",
      name: "Comprehensive Health",
      provider: "Wellness Co",
      description: "Medical, dental, and vision coverage",
      administratorId: "1",
    },
  ]);

  await db.insert(benefitEnrollment).values([
    {
      workspaceId: "workspace_1",
      id: "benefitenroll-thomas",
      benefitPlanId: "benefit-health",
      employeeId: "employee-thomas",
      enrolledAt: new Date("2021-04-12T12:00:00Z"),
      coverageLevel: "family",
    },
    {
      workspaceId: "workspace_1",
      id: "benefitenroll-priya",
      benefitPlanId: "benefit-health",
      employeeId: "employee-priya",
      enrolledAt: new Date("2022-01-03T12:00:00Z"),
      coverageLevel: "individual",
    },
  ]);

  await db.insert(timesheet).values([
    {
      workspaceId: "workspace_1",
      id: "timesheet-thomas-week12",
      employeeId: "employee-thomas",
      periodStart: "2024-03-04",
      periodEnd: "2024-03-10",
      submittedById: "4",
      status: "submitted",
    },
    {
      workspaceId: "workspace_1",
      id: "timesheet-amelia-week12",
      employeeId: "employee-amelia",
      periodStart: "2024-03-04",
      periodEnd: "2024-03-10",
      submittedById: "7",
      status: "approved",
    },
  ]);

  await db.insert(timeEntry).values([
    {
      workspaceId: "workspace_1",
      id: "timeentry-thomas-1",
      timesheetId: "timesheet-thomas-week12",
      taskId: "task-automation",
      hours: "6.50",
      notes: "Vendor coordination and integration planning.",
      entryDate: "2024-03-06",
    },
    {
      workspaceId: "workspace_1",
      id: "timeentry-amelia-1",
      timesheetId: "timesheet-amelia-week12",
      taskId: "task-launch-plan",
      hours: "4.00",
      notes: "Prepared launch checklist draft.",
      entryDate: "2024-03-07",
    },
  ]);

  await db.insert(expenseReport).values([
    {
      workspaceId: "workspace_1",
      id: "expense-ops-travel",
      ownerId: "4",
      departmentId: "dept-ops",
      status: "submitted",
      submittedAt: new Date("2024-03-08T18:30:00Z"),
    },
  ]);

  await db.insert(expenseItem).values([
    {
      workspaceId: "workspace_1",
      id: "expenseitem-flight",
      reportId: "expense-ops-travel",
      amount: "425.50",
      category: "travel",
      incurredAt: "2024-03-02",
      merchant: "Skyline Air",
      notes: "Flight to customer onsite.",
    },
    {
      workspaceId: "workspace_1",
      id: "expenseitem-hotel",
      reportId: "expense-ops-travel",
      amount: "612.75",
      category: "lodging",
      incurredAt: "2024-03-04",
      merchant: "City Center Hotel",
      notes: "Three-night stay for onsite workshop.",
    },
  ]);

  await db.insert(ledgerAccount).values([
    {
      workspaceId: "workspace_1",
      id: "ledger-root",
      name: "Root Account",
      code: "1000",
      accountType: "equity",
    },
    {
      workspaceId: "workspace_1",
      id: "ledger-revenue",
      name: "Revenue",
      code: "4000",
      accountType: "revenue",
      parentAccountId: "ledger-root",
    },
    {
      workspaceId: "workspace_1",
      id: "ledger-expense",
      name: "Travel Expense",
      code: "6100",
      accountType: "expense",
      parentAccountId: "ledger-root",
    },
  ]);

  await db.insert(ledgerTransaction).values([
    {
      workspaceId: "workspace_1",
      id: "ledger-txn-1",
      reference: "INV-1001",
      transactionDate: "2024-05-16",
      createdById: "4",
      description: "Invoice posted for Aurora Manufacturing",
    },
  ]);

  await db.insert(ledgerEntry).values([
    {
      workspaceId: "workspace_1",
      id: "ledgerentry-1",
      transactionId: "ledger-txn-1",
      accountId: "ledger-revenue",
      credit: "22498.00",
      memo: "Aurora invoice revenue",
    },
    {
      workspaceId: "workspace_1",
      id: "ledgerentry-2",
      transactionId: "ledger-txn-1",
      accountId: "ledger-expense",
      debit: "1038.25",
      memo: "Travel expenses for onsite workshop",
    },
  ]);

  await db.insert(budget).values([
    {
      workspaceId: "workspace_1",
      id: "budget-ops-2024",
      departmentId: "dept-ops",
      fiscalYear: 2024,
      totalAmount: "500000.00",
      currency: "USD",
    },
  ]);

  await db.insert(budgetLine).values([
    {
      workspaceId: "workspace_1",
      id: "budgetline-ops-travel",
      budgetId: "budget-ops-2024",
      accountId: "ledger-expense",
      amount: "85000.00",
    },
  ]);

  await db.insert(supportTicket).values([
    {
      workspaceId: "workspace_1",
      id: "ticket-aurora-001",
      customerId: "3",
      assignedTeamId: "team-ops",
      subject: "Workflow sync delay",
      status: "open",
      priority: "high",
      source: "email",
    },
  ]);

  await db.insert(supportTicketMessage).values([
    {
      workspaceId: "workspace_1",
      id: "ticketmsg-1",
      ticketId: "ticket-aurora-001",
      authorId: "3",
      body: "We are seeing delays in workflow replication for site B.",
      visibility: "customer",
    },
    {
      workspaceId: "workspace_1",
      id: "ticketmsg-2",
      ticketId: "ticket-aurora-001",
      authorId: "4",
      body: "Investigating logs for site B. Will update within an hour.",
      visibility: "internal",
    },
  ]);

  await db.insert(supportTicketTag).values([
    {
      workspaceId: "workspace_1",
      id: "tickettag-urgent",
      label: "Urgent",
      description: "Needs immediate attention",
    },
    {
      workspaceId: "workspace_1",
      id: "tickettag-sync",
      label: "Sync",
      description: "Replication or sync related",
    },
  ]);

  await db.insert(supportTicketTagLink).values([
    {
      workspaceId: "workspace_1",
      id: "tickettaglink-1",
      ticketId: "ticket-aurora-001",
      tagId: "tickettag-urgent",
    },
    {
      workspaceId: "workspace_1",
      id: "tickettaglink-2",
      ticketId: "ticket-aurora-001",
      tagId: "tickettag-sync",
    },
  ]);

  await db.insert(supportTicketAssignment).values([
    {
      workspaceId: "workspace_1",
      id: "ticketassign-1",
      ticketId: "ticket-aurora-001",
      assigneeId: "6",
      assignedAt: new Date("2024-03-09T14:00:00Z"),
      assignmentType: "primary",
    },
  ]);

  await db.insert(supportTicketAudit).values([
    {
      workspaceId: "workspace_1",
      id: "ticketaudit-1",
      ticketId: "ticket-aurora-001",
      actorId: "4",
      action: "STATUS_CHANGE",
      details: { from: "new", to: "open" },
    },
  ]);

  await db.insert(marketingCampaign).values([
    {
      workspaceId: "workspace_1",
      id: "campaign-q4",
      ownerId: "5",
      name: "Q4 Launch",
      status: "planning",
      startDate: "2024-09-01",
      endDate: "2024-12-15",
      budgetAmount: "120000.00",
    },
  ]);

  await db.insert(marketingChannel).values([
    {
      workspaceId: "workspace_1",
      id: "channel-email",
      name: "Email",
      channelType: "owned",
      costModel: "per_send",
    },
    {
      workspaceId: "workspace_1",
      id: "channel-social",
      name: "Paid Social",
      channelType: "paid",
      costModel: "cpm",
    },
  ]);

  await db.insert(marketingCampaignChannel).values([
    {
      workspaceId: "workspace_1",
      id: "campaignchannel-email",
      campaignId: "campaign-q4",
      channelId: "channel-email",
      allocation: "45000.00",
    },
    {
      workspaceId: "workspace_1",
      id: "campaignchannel-social",
      campaignId: "campaign-q4",
      channelId: "channel-social",
      allocation: "75000.00",
    },
  ]);

  await db.insert(marketingAudience).values([
    {
      workspaceId: "workspace_1",
      id: "audience-enterprise",
      name: "Enterprise Ops Leaders",
      segmentType: "dynamic",
      definition: { filters: ["industry:manufacturing", "employees:500+"] },
    },
  ]);

  await db.insert(marketingCampaignAudience).values([
    {
      workspaceId: "workspace_1",
      id: "campaignaudience-1",
      campaignId: "campaign-q4",
      audienceId: "audience-enterprise",
    },
  ]);

  await db.insert(analyticsDashboard).values([
    {
      workspaceId: "workspace_1",
      id: "dashboard-revenue",
      ownerId: "1",
      title: "Revenue Pulse",
      description: "Pipeline and bookings snapshot",
      defaultQuery: {
        dimensions: ["hour", "day", "week", "month"],
        metrics: ["sum(amount)"],
        limit: 10,
        timezone: "UTC",
        filters: [],
      },
    },
  ]);

  await db.insert(analyticsWidget).values([
    {
      workspaceId: "workspace_1",
      id: "widget-pipeline",
      dashboardId: "dashboard-revenue",
      title: "Pipeline by Stage",
      widgetType: "bar",
      position: 1,
    },
    {
      workspaceId: "workspace_1",
      id: "widget-bookings",
      dashboardId: "dashboard-revenue",
      title: "Bookings Trend",
      widgetType: "line",
      position: 2,
    },
  ]);

  await db.insert(analyticsWidgetQuery).values([
    {
      workspaceId: "workspace_1",
      id: "widgetquery-pipeline",
      widgetId: "widget-pipeline",
      dataSource: "warehouse",
      query: "SELECT stage, sum(amount) FROM pipeline GROUP BY stage",
      refreshIntervalSeconds: 900,
    },
    {
      workspaceId: "workspace_1",
      id: "widgetquery-bookings",
      widgetId: "widget-bookings",
      dataSource: "warehouse",
      query: "SELECT close_date, sum(amount) FROM bookings GROUP BY close_date",
      refreshIntervalSeconds: 1800,
    },
  ]);

  await db.insert(integrationWebhook).values([
    {
      workspaceId: "workspace_1",
      id: "webhook-ops",
      projectId: "project-ops",
      accountId: "acct-aurora",
      name: "Ops Sync",
      url: "https://hooks.example.com/ops-sync",
      secret: "secret-ops",
      isActive: true,
    },
  ]);

  await db.insert(integrationEvent).values([
    {
      workspaceId: "workspace_1",
      id: "event-ops-1",
      webhookId: "webhook-ops",
      payload: { orderId: "order-1001", status: "processing" },
      eventType: "order.updated",
      deliveredAt: new Date("2024-05-20T08:05:00Z"),
      status: "delivered",
    },
  ]);

  await db.insert(integrationCredential).values([
    {
      workspaceId: "workspace_1",
      id: "credential-ops",
      webhookId: "webhook-ops",
      provider: "OpsBridge",
      clientId: "ops-client",
      clientSecret: "ops-secret",
      metadata: { scopes: ["orders:read", "orders:write"] },
    },
  ]);

  await db.insert(allTypes).values({
    workspaceId: "workspace_1",
    id: "1",
    smallintField: 1,
    integerField: 2,
    bigintField: 95807n,
    bigintNumberField: 444,
    smallSerialField: 1,
    serialField: 1,
    bigSerialField: 1,
    numericField: "8.8",
    decimalField: "9.9",
    realField: 10.8,
    doublePrecisionField: 11.9,
    textField: "text",
    charField: "c",
    uuidField: "123e4567-e89b-12d3-a456-426614174000",
    varcharField: "varchar",
    booleanField: true,
    timestampField: new Date(),
    timestampTzField: new Date(),
    timestampModeString: new Date().toISOString(),
    timestampModeDate: new Date(),
    dateField: new Date().toISOString(),
    jsonField: { key: "value" },
    jsonbField: { key: "value" },
    typedJsonField: { theme: "light", fontSize: 16 },
    status: "pending",
    textArray: ["text", "text2"],
    intArray: [1, 2],
    // boolArray: [true, false],
    numericArray: [8.8, 9.9],
    uuidArray: [
      "123e4567-e89b-12d3-a456-426614174001",
      "123e4567-e89b-12d3-a456-426614174002",
    ],
    jsonbArray: [{ key: "value" }, { key: "value2" }],
    enumArray: ["pending", "active"],
    optionalSmallint: 5,
    optionalInteger: 99,
    optionalBigint: 12345,
    optionalNumeric: "5.50",
    optionalReal: 2.5,
    optionalDoublePrecision: 15.75,
    optionalText: "optional text",
    optionalBoolean: false,
    optionalTimestamp: new Date(),
    optionalJson: { info: "optional" },
    optionalEnum: "active",
    optionalVarchar: "optional",
    optionalUuid: "123e4567-e89b-12d3-a456-426614174099",
  });

  await db.insert(friendship).values({
    workspaceId: "workspace_1",
    requestingId: "1",
    acceptingId: "2",
    accepted: true,
  });

  await db.insert(workspaceMembership).values([
    {
      id: "wm_1",
      workspaceId: "workspace_1",
      userId: "1",
      role: "owner",
      joinedAt: new Date(),
    },
    {
      id: "wm_2",
      workspaceId: "workspace_1",
      userId: "2",
      role: "admin",
      joinedAt: new Date(),
    },
    {
      id: "wm_3",
      workspaceId: "workspace_2",
      userId: "3",
      role: "owner",
      joinedAt: new Date(),
    },
  ]);

  await db.insert(workspaceApiKey).values({
    id: "api_key_1",
    workspaceId: "workspace_1",
    name: "Production API Key",
    keyHash: "hashed_key_123",
    createdBy: "1",
    lastUsedAt: new Date(),
  });

  // ====== NEW CRM EXPANSION DATA ======
  await db.insert(crmLeadSource).values([
    {
      id: "source_1",
      workspaceId: "workspace_1",
      name: "Website",
      type: "inbound",
    },
    {
      id: "source_2",
      workspaceId: "workspace_1",
      name: "Referral",
      type: "inbound",
    },
  ]);

  await db.insert(crmLead).values([
    {
      id: "lead_1",
      workspaceId: "workspace_1",
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice@prospect.com",
      company: "Prospect Co",
      sourceId: "source_1",
      ownerId: "1",
      status: "new",
      score: 75,
    },
    {
      id: "lead_2",
      workspaceId: "workspace_1",
      firstName: "Bob",
      lastName: "Smith",
      email: "bob@startup.com",
      company: "Startup Inc",
      sourceId: "source_2",
      ownerId: "2",
      status: "qualified",
      score: 85,
    },
  ]);

  await db.insert(crmLeadActivity).values({
    id: "activity_1",
    workspaceId: "workspace_1",
    leadId: "lead_1",
    userId: "1",
    activityType: "email",
    description: "Sent introduction email",
    activityDate: new Date(),
  });

  await db.insert(crmSalesSequence).values({
    id: "seq_1",
    workspaceId: "workspace_1",
    name: "Welcome Sequence",
    description: "New lead onboarding",
    isActive: true,
    createdBy: "1",
  });

  await db.insert(crmSalesSequenceStep).values([
    {
      id: "step_1",
      workspaceId: "workspace_1",
      sequenceId: "seq_1",
      stepOrder: 1,
      stepType: "email",
      content: "Welcome email",
      delayDays: 0,
    },
    {
      id: "step_2",
      workspaceId: "workspace_1",
      sequenceId: "seq_1",
      stepOrder: 2,
      stepType: "task",
      content: "Follow-up call",
      delayDays: 3,
    },
  ]);

  // ====== NEW HR DATA ======
  await db.insert(hrDepartment).values([
    {
      id: "dept_1",
      workspaceId: "workspace_1",
      name: "Engineering",
      description: "Software development team",
    },
    {
      id: "dept_2",
      workspaceId: "workspace_1",
      name: "Sales",
      description: "Sales team",
    },
  ]);

  await db.insert(hrEmployee).values([
    {
      id: "emp_1",
      workspaceId: "workspace_1",
      userId: "1",
      employeeNumber: "EMP001",
      firstName: "James",
      lastName: "Developer",
      email: "james@example.com",
      hireDate: new Date("2023-01-01"),
      departmentId: "dept_1",
      status: "active",
    },
    {
      id: "emp_2",
      workspaceId: "workspace_1",
      userId: "2",
      employeeNumber: "EMP002",
      firstName: "Sarah",
      lastName: "Sales",
      email: "sarah@example.com",
      hireDate: new Date("2023-03-15"),
      departmentId: "dept_2",
      managerId: "emp_1",
      status: "active",
    },
  ]);

  await db.insert(hrTimeOffPolicy).values({
    id: "policy_1",
    workspaceId: "workspace_1",
    name: "Annual Leave",
    policyType: "vacation",
    daysPerYear: 20,
    carryoverDays: 5,
  });

  await db.insert(hrTimeOffRequest).values({
    id: "timeoff_1",
    workspaceId: "workspace_1",
    employeeId: "emp_1",
    policyId: "policy_1",
    startDate: "2024-06-01",
    endDate: "2024-06-05",
    days: "5.00",
    status: "approved",
    approverId: "emp_2",
    approvedAt: new Date(),
  });

  // ====== NEW FINANCE DATA ======
  await db.insert(apVendor).values([
    {
      id: "vendor_1",
      workspaceId: "workspace_1",
      name: "Office Supplies Co",
      email: "sales@officesupplies.com",
      paymentTerms: "Net 30",
    },
    {
      id: "vendor_2",
      workspaceId: "workspace_1",
      name: "Cloud Services Inc",
      email: "billing@cloudservices.com",
      paymentTerms: "Net 15",
    },
  ]);

  await db.insert(apInvoice).values({
    id: "ap_inv_1",
    workspaceId: "workspace_1",
    vendorId: "vendor_1",
    invoiceNumber: "INV-2024-001",
    invoiceDate: "2024-01-15",
    dueDate: "2024-02-15",
    totalAmount: "1500.00",
    paidAmount: "1500.00",
    status: "paid",
  });

  await db.insert(arCustomer).values([
    {
      id: "customer_1",
      workspaceId: "workspace_1",
      name: "Big Client Corp",
      email: "ap@bigclient.com",
      billingAddress: "123 Business St",
    },
    {
      id: "customer_2",
      workspaceId: "workspace_1",
      name: "Small Business LLC",
      email: "finance@smallbiz.com",
      billingAddress: "456 Main Ave",
    },
  ]);

  await db.insert(arInvoice).values({
    id: "ar_inv_1",
    workspaceId: "workspace_1",
    customerId: "customer_1",
    invoiceNumber: "INV-OUT-2024-001",
    invoiceDate: "2024-02-01",
    dueDate: "2024-03-01",
    totalAmount: "5000.00",
    paidAmount: "5000.00",
    status: "paid",
  });

  await db.insert(bankAccount).values({
    id: "bank_1",
    workspaceId: "workspace_1",
    accountName: "Operating Account",
    accountNumber: "****1234",
    bankName: "Business Bank",
    accountType: "checking",
    currency: "USD",
    balance: "50000.00",
  });

  await db.insert(bankTransaction).values([
    {
      id: "txn_1",
      workspaceId: "workspace_1",
      accountId: "bank_1",
      transactionDate: "2024-01-15",
      description: "Payment from Big Client Corp",
      amount: "5000.00",
      transactionType: "credit",
      reconciled: true,
    },
    {
      id: "txn_2",
      workspaceId: "workspace_1",
      accountId: "bank_1",
      transactionDate: "2024-01-20",
      description: "Office supplies payment",
      amount: "-1500.00",
      transactionType: "debit",
      reconciled: true,
    },
  ]);

  // ====== NEW PRODUCT & INVENTORY DATA ======
  await db.insert(productCatalog).values({
    id: "catalog_1",
    workspaceId: "workspace_1",
    name: "Main Catalog",
    description: "Primary product catalog",
    isActive: true,
  });
};

export const shutdown = async () => {
  try {
    await pool.end();
    await zeroContainer?.stop({ remove: true });
    await postgresContainer?.stop({ remove: true });
    await startedNetwork?.stop();
  } catch (error) {}
};

export const startPostgres = async () => {
  startedNetwork = await new Network().start();

  // Start PostgreSQL container
  postgresContainer = await new PostgreSqlContainer(
    `postgres:${process.env.PG_VERSION ?? "16"}`,
  )
    .withDatabase("drizzle_zero")
    .withUsername("user")
    .withPassword("password")
    .withNetwork(startedNetwork)
    .withNetworkAliases("postgres-db")
    .withExposedPorts({
      container: 5432,
      host: PG_PORT,
    })
    .withCommand([
      "postgres",
      "-c",
      "wal_level=logical",
      "-c",
      "max_wal_senders=10",
      "-c",
      "max_replication_slots=5",
      "-c",
      "hot_standby=on",
      "-c",
      "hot_standby_feedback=on",
    ])
    .withCopyDirectoriesToContainer([
      {
        source: path.join(__dirname, "./drizzle"),
        target: "/docker-entrypoint-initdb.d",
      },
    ])
    .withPullPolicy(PullPolicy.alwaysPull())
    .start();

  return {
    postgresContainer,
  };
};

export const startZero = async (options: { getQueriesUrl: string }) => {
  if (!startedNetwork || !postgresContainer) {
    throw new Error("Network or postgres container not started");
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
      ZERO_AUTH_SECRET: "secretkey",
      ZERO_REPLICA_FILE: "/zero.db",
      ZERO_NUM_SYNC_WORKERS: "1",
      ZERO_ADMIN_PASSWORD: "password",
      ZERO_GET_QUERIES_URL: options.getQueriesUrl,
    })
    .withExtraHosts([
      { host: "host.docker.internal", ipAddress: "host-gateway" },
    ])
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
  const { postgresContainer } = await startPostgres();
  const { zeroContainer } = await startZero(options);

  await seed();

  return {
    postgresContainer,
    zeroContainer,
  };
};
