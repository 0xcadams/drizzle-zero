import { syncedQueryWithContext } from "@rocicorp/zero";
import { z } from "zod";
import { builder } from "./zero-schema.gen";

export const allUsers = syncedQueryWithContext(
  "integration.allUsers",
  z.tuple([]),
  (_ctx) => builder.user.orderBy("id", "asc"),
);

export const filtersWithChildren = syncedQueryWithContext(
  "integration.filtersWithChildren",
  z.tuple([z.string()]),
  (_ctx, rootId) =>
    builder.filters
      .where((q) => q.cmp("id", "=", rootId))
      .related("children", (q) => q.related("children").orderBy("id", "asc")),
);

export const messagesBySender = syncedQueryWithContext(
  "integration.messagesBySender",
  z.tuple([z.string()]),
  (_ctx, senderId) =>
    builder.message
      .where((q) => q.cmp("senderId", "=", senderId))
      .orderBy("id", "asc"),
);

export const messagesByBody = syncedQueryWithContext(
  "integration.messagesByBody",
  z.tuple([z.string()]),
  (_ctx, body) =>
    builder.message.where((q) => q.cmp("body", "=", body)).orderBy("id", "asc"),
);

export const messageWithRelations = syncedQueryWithContext(
  "integration.messageWithRelations",
  z.tuple([z.string()]),
  (_ctx, id) =>
    builder.message
      .where((q) => q.cmp("id", "=", id))
      .related("medium")
      .related("sender")
      .one(),
);

export const userWithMediums = syncedQueryWithContext(
  "integration.userWithMediums",
  z.tuple([z.string()]),
  (_ctx, id) =>
    builder.user
      .where((q) => q.cmp("id", "=", id))
      .related("mediums")
      .one(),
);

export const userWithFriends = syncedQueryWithContext(
  "integration.userWithFriends",
  z.tuple([z.string()]),
  (_ctx, id) =>
    builder.user
      .where((q) => q.cmp("id", "=", id))
      .related("friends")
      .one(),
);

export const messageById = syncedQueryWithContext(
  "integration.messageById",
  z.tuple([z.string()]),
  (_ctx, id) => builder.message.where((q) => q.cmp("id", "=", id)).one(),
);

export const mediumById = syncedQueryWithContext(
  "integration.mediumById",
  z.tuple([z.string()]),
  (_ctx, id) => builder.medium.where((q) => q.cmp("id", "=", id)).one(),
);

export const allTypesById = syncedQueryWithContext(
  "integration.allTypesById",
  z.tuple([z.string()]),
  (_ctx, id) => builder.allTypes.where((q) => q.cmp("id", "=", id)).one(),
);

export const allTypesByStatus = syncedQueryWithContext(
  "integration.allTypesByStatus",
  z.tuple([z.enum(["active", "inactive", "pending"])]),
  (_ctx, status) =>
    builder.allTypes.where((q) => q.cmp("status", "=", status)).one(),
);

export const complexOrderWithEverything = syncedQueryWithContext(
  "integration.complexOrderWithEverything",
  z.tuple([z.string()]),
  (_ctx, orderId) =>
    builder.orderTable
      .where((q) => q.cmp("id", "=", orderId))
      .related("customer", (q) =>
        q
          .related("messages", (q2) =>
            q2
              .related("medium", (q3) =>
                q3.related("messages", (q4) =>
                  q4.related("sender").related("medium").orderBy("id", "asc"),
                ),
              )
              .related("sender", (q3) =>
                q3.related("messages").related("friends"),
              )
              .orderBy("id", "asc"),
          )
          .related("friends", (q2) =>
            q2
              .related("messages", (q3) =>
                q3.related("medium").related("sender").orderBy("id", "asc"),
              )
              .related("friends", (q3) => q3.related("messages")),
          ),
      )
      .related("opportunity", (q) =>
        q
          .related("account", (q2) =>
            q2
              .related("owner", (q3) =>
                q3.related("messages").related("friends"),
              )
              .related("contacts", (q3) =>
                q3
                  .related("account", (q4) =>
                    q4
                      .related("owner")
                      .related("opportunities")
                      .related("contacts"),
                  )
                  .related("activities", (q4) =>
                    q4
                      .related("type", (q5) => q5.related("activities"))
                      .related("contact", (q5) =>
                        q5.related("account").related("notes"),
                      )
                      .related("opportunity", (q5) =>
                        q5.related("account").related("stage"),
                      )
                      .related("performer", (q5) =>
                        q5.related("messages").related("friends"),
                      )
                      .related("account", (q5) =>
                        q5.related("opportunities").related("contacts"),
                      )
                      .orderBy("contactId", "asc"),
                  )
                  .related("notes", (q4) =>
                    q4
                      .related("author", (q5) =>
                        q5.related("messages").related("friends"),
                      )
                      .related("contact", (q5) =>
                        q5.related("account").related("activities"),
                      )
                      .related("account", (q5) =>
                        q5.related("contacts").related("opportunities"),
                      )
                      .orderBy("id", "asc"),
                  )
                  .orderBy("id", "asc"),
              )
              .related("opportunities", (q3) =>
                q3
                  .related("account", (q4) =>
                    q4.related("owner").related("contacts").related("notes"),
                  )
                  .related("stage", (q4) =>
                    q4
                      .related("opportunities", (q5) =>
                        q5
                          .related("activities")
                          .related("account")
                          .orderBy("id", "asc"),
                      )
                      .related("historyEntries", (q5) =>
                        q5
                          .related("changedBy")
                          .related("opportunity")
                          .orderBy("id", "asc"),
                      ),
                  )
                  .related("activities", (q4) =>
                    q4
                      .related("type", (q5) => q5.related("activities"))
                      .related("performer", (q5) =>
                        q5.related("messages").related("friends"),
                      )
                      .related("account", (q5) => q5.related("opportunities"))
                      .related("contact", (q5) => q5.related("notes"))
                      .related("opportunity", (q5) => q5.related("stage"))
                      .orderBy("id", "asc"),
                  )
                  .related("historyEntries", (q4) =>
                    q4
                      .related("opportunity", (q5) =>
                        q5.related("stage").related("account"),
                      )
                      .related("stage", (q5) => q5.related("opportunities"))
                      .related("changedBy", (q5) =>
                        q5.related("messages").related("friends"),
                      )
                      .orderBy("id", "asc"),
                  )
                  .orderBy("id", "asc"),
              )
              .related("activities", (q3) =>
                q3
                  .related("account", (q4) =>
                    q4.related("opportunities").related("contacts"),
                  )
                  .related("contact", (q4) =>
                    q4.related("notes").related("activities"),
                  )
                  .related("opportunity", (q4) =>
                    q4.related("stage").related("account"),
                  )
                  .related("type", (q4) => q4.related("activities"))
                  .related("performer", (q4) =>
                    q4.related("friends").related("messages"),
                  )
                  .orderBy("id", "asc"),
              )
              .related("notes", (q3) =>
                q3
                  .related("account", (q4) =>
                    q4.related("contacts").related("opportunities"),
                  )
                  .related("contact", (q4) =>
                    q4.related("activities").related("account"),
                  )
                  .related("author", (q4) =>
                    q4.related("messages").related("friends"),
                  )
                  .orderBy("id", "asc"),
              ),
          )
          .related("stage", (q2) =>
            q2
              .related("opportunities", (q3) =>
                q3
                  .related("account", (q4) => q4.related("activities"))
                  .related("activities", (q4) => q4.related("type"))
                  .orderBy("id", "asc"),
              )
              .related("historyEntries", (q3) =>
                q3
                  .related("opportunity", (q4) => q4.related("account"))
                  .related("changedBy", (q4) => q4.related("messages"))
                  .orderBy("id", "asc"),
              ),
          )
          .related("activities", (q2) =>
            q2
              .related("account", (q3) =>
                q3.related("opportunities").related("contacts"),
              )
              .related("contact", (q3) =>
                q3.related("notes").related("activities"),
              )
              .related("opportunity", (q3) =>
                q3.related("stage").related("account"),
              )
              .related("type", (q3) => q3.related("activities"))
              .related("performer", (q3) => q3.related("messages"))
              .orderBy("id", "asc"),
          )
          .related("historyEntries", (q2) =>
            q2
              .related("opportunity", (q3) =>
                q3.related("account").related("stage"),
              )
              .related("stage", (q3) =>
                q3.related("opportunities").related("historyEntries"),
              )
              .related("changedBy", (q3) => q3.related("friends"))
              .orderBy("id", "asc"),
          ),
      )
      .related("items", (q) =>
        q
          .related("order", (q2) =>
            q2
              .related("customer", (q3) =>
                q3.related("messages").related("friends"),
              )
              .related("opportunity", (q3) =>
                q3.related("account").related("stage").related("activities"),
              )
              .related("items", (q3) =>
                q3.related("variant").related("order").orderBy("id", "asc"),
              )
              .related("payments", (q3) =>
                q3.related("payment").related("order").orderBy("id", "asc"),
              )
              .related("shipments", (q3) =>
                q3.related("items").related("order").orderBy("id", "asc"),
              ),
          )
          .related("variant", (q2) =>
            q2
              .related("product", (q3) =>
                q3
                  .related("category", (q4) =>
                    q4
                      .related("parent", (q5) =>
                        q5
                          .related("parent", (q6) =>
                            q6.related("children").related("products"),
                          )
                          .related("children", (q6) =>
                            q6
                              .related("products")
                              .related("parent")
                              .orderBy("id", "asc"),
                          )
                          .related("products", (q6) =>
                            q6.related("variants").related("media"),
                          ),
                      )
                      .related("children", (q5) =>
                        q5
                          .related("parent", (q6) =>
                            q6.related("products").related("children"),
                          )
                          .related("products", (q6) =>
                            q6.related("category").related("variants"),
                          )
                          .related("children", (q6) =>
                            q6.related("parent").related("products"),
                          )
                          .orderBy("id", "asc"),
                      )
                      .related("products", (q5) =>
                        q5.related("category").related("variants"),
                      ),
                  )
                  .related("variants", (q4) =>
                    q4
                      .related("product", (q5) =>
                        q5.related("category").related("media"),
                      )
                      .related("inventoryItems", (q5) =>
                        q5.related("variant").orderBy("id", "asc"),
                      )
                      .related("inventoryLevels", (q5) =>
                        q5
                          .related("location", (q6) =>
                            q6.related("levels").orderBy("id", "asc"),
                          )
                          .related("variant", (q6) =>
                            q6.related("product").related("inventoryItems"),
                          )
                          .orderBy("id", "asc"),
                      )
                      .related("orderItems", (q5) =>
                        q5
                          .related("order")
                          .related("variant")
                          .orderBy("id", "asc"),
                      )
                      .orderBy("id", "asc"),
                  )
                  .related("media", (q4) =>
                    q4.related("product").orderBy("id", "asc"),
                  ),
              )
              .related("inventoryItems", (q3) =>
                q3.related("variant").orderBy("id", "asc"),
              )
              .related("inventoryLevels", (q3) =>
                q3
                  .related("location", (q4) =>
                    q4.related("levels").orderBy("id", "asc"),
                  )
                  .related("variant", (q4) =>
                    q4.related("product").related("orderItems"),
                  )
                  .orderBy("id", "asc"),
              )
              .related("orderItems", (q3) =>
                q3.related("order").related("variant").orderBy("id", "asc"),
              ),
          )
          .orderBy("id", "asc"),
      )
      .related("payments", (q) =>
        q
          .related("order", (q2) =>
            q2
              .related("customer", (q3) =>
                q3.related("messages").related("friends"),
              )
              .related("opportunity", (q3) =>
                q3.related("account").related("stage"),
              )
              .related("items", (q3) => q3.related("variant"))
              .related("payments", (q3) =>
                q3.related("payment").orderBy("id", "asc"),
              )
              .related("shipments", (q3) =>
                q3.related("items").orderBy("id", "asc"),
              ),
          )
          .related("payment")
          .orderBy("id", "asc"),
      )
      .related("shipments", (q) =>
        q
          .related("order", (q2) =>
            q2
              .related("customer", (q3) =>
                q3.related("messages").related("friends"),
              )
              .related("opportunity", (q3) =>
                q3.related("account").related("historyEntries"),
              )
              .related("items", (q3) => q3.related("variant"))
              .related("payments", (q3) =>
                q3.related("payment").related("order"),
              )
              .related("shipments", (q3) =>
                q3.related("items").orderBy("id", "asc"),
              ),
          )
          .related("items", (q2) =>
            q2
              .related("shipment", (q3) =>
                q3.related("order").related("items").orderBy("id", "asc"),
              )
              .related("orderItem", (q3) =>
                q3
                  .related("order", (q4) =>
                    q4
                      .related("customer", (q5) =>
                        q5.related("messages").related("friends"),
                      )
                      .related("opportunity", (q5) =>
                        q5.related("account").related("stage"),
                      )
                      .related("items", (q5) => q5.related("variant"))
                      .related("payments", (q5) => q5.related("payment"))
                      .related("shipments", (q5) => q5.related("order")),
                  )
                  .related("variant", (q4) =>
                    q4
                      .related("product", (q5) =>
                        q5.related("category").related("variants"),
                      )
                      .related("inventoryItems")
                      .related("inventoryLevels")
                      .related("orderItems"),
                  ),
              )
              .orderBy("id", "asc"),
          )
          .orderBy("id", "asc"),
      )
      .one(),
);

// ============================================================================
// NEW WORKSPACE & MULTI-TENANCY QUERIES
// ============================================================================

export const workspaceById = syncedQueryWithContext(
  "integration.workspaceById",
  z.tuple([z.string()]),
  (_ctx, id) => builder.workspace.where((q) => q.cmp("id", "=", id)).one(),
);

export const workspaceWithMembers = syncedQueryWithContext(
  "integration.workspaceWithMembers",
  z.tuple([z.string()]),
  (_ctx, id) =>
    builder.workspace
      .where((q) => q.cmp("id", "=", id))
      .related("memberships", (q) => q.related("user"))
      .one(),
);

export const workspaceApiKeys = syncedQueryWithContext(
  "integration.workspaceApiKeys",
  z.tuple([z.string()]),
  (_ctx, workspaceId) =>
    builder.workspaceApiKey
      .where((q) => q.cmp("workspaceId", "=", workspaceId))
      .related("workspace")
      .related("creator")
      .orderBy("createdAt", "desc"),
);

// ============================================================================
// NEW CRM EXPANSION QUERIES
// ============================================================================

export const crmLeadsByWorkspace = syncedQueryWithContext(
  "integration.crmLeadsByWorkspace",
  z.tuple([z.string()]),
  (_ctx, workspaceId) =>
    builder.crmLead
      .where((q) => q.cmp("workspaceId", "=", workspaceId))
      .related("source")
      .related("owner")
      .orderBy("createdAt", "desc"),
);

export const crmLeadWithActivities = syncedQueryWithContext(
  "integration.crmLeadWithActivities",
  z.tuple([z.string()]),
  (_ctx, leadId) =>
    builder.crmLead
      .where((q) => q.cmp("id", "=", leadId))
      .related("activities", (q) => q.related("user").orderBy("activityDate", "desc"))
      .related("source")
      .related("owner")
      .one(),
);

export const crmSalesSequenceWithSteps = syncedQueryWithContext(
  "integration.crmSalesSequenceWithSteps",
  z.tuple([z.string()]),
  (_ctx, sequenceId) =>
    builder.crmSalesSequence
      .where((q) => q.cmp("id", "=", sequenceId))
      .related("steps", (q) => q.orderBy("stepOrder", "asc"))
      .related("enrollments")
      .one(),
);

export const opportunityWithLineItems = syncedQueryWithContext(
  "integration.opportunityWithLineItems",
  z.tuple([z.string()]),
  (_ctx, opportunityId) =>
    builder.opportunity
      .where((q) => q.cmp("id", "=", opportunityId))
      .related("lineItems")
      .related("documents")
      .related("account")
      .one(),
);

// ============================================================================
// NEW HR QUERIES
// ============================================================================

export const hrEmployeesByDepartment = syncedQueryWithContext(
  "integration.hrEmployeesByDepartment",
  z.tuple([z.string()]),
  (_ctx, departmentId) =>
    builder.hrEmployee
      .where((q) => q.cmp("departmentId", "=", departmentId))
      .related("department")
      .related("manager")
      .related("user")
      .orderBy("employeeNumber", "asc"),
);

export const hrEmployeeWithTimeOff = syncedQueryWithContext(
  "integration.hrEmployeeWithTimeOff",
  z.tuple([z.string()]),
  (_ctx, employeeId) =>
    builder.hrEmployee
      .where((q) => q.cmp("id", "=", employeeId))
      .related("timeOffRequests", (q) => q.related("policy").orderBy("startDate", "desc"))
      .related("department")
      .one(),
);

export const hrDepartmentWithEmployees = syncedQueryWithContext(
  "integration.hrDepartmentWithEmployees",
  z.tuple([z.string()]),
  (_ctx, departmentId) =>
    builder.hrDepartment
      .where((q) => q.cmp("id", "=", departmentId))
      .related("employees", (q) => q.related("user"))
      .related("head")
      .one(),
);

export const hrPerformanceReviewsByEmployee = syncedQueryWithContext(
  "integration.hrPerformanceReviewsByEmployee",
  z.tuple([z.string()]),
  (_ctx, employeeId) =>
    builder.hrPerformanceReview
      .where((q) => q.cmp("employeeId", "=", employeeId))
      .related("employee")
      .related("reviewer")
      .related("cycle")
      .orderBy("reviewDate", "desc"),
);

// ============================================================================
// NEW FINANCE QUERIES
// ============================================================================

export const apInvoicesByVendor = syncedQueryWithContext(
  "integration.apInvoicesByVendor",
  z.tuple([z.string()]),
  (_ctx, vendorId) =>
    builder.apInvoice
      .where((q) => q.cmp("vendorId", "=", vendorId))
      .related("vendor")
      .related("lineItems")
      .related("payments")
      .orderBy("invoiceDate", "desc"),
);

export const arInvoicesByCustomer = syncedQueryWithContext(
  "integration.arInvoicesByCustomer",
  z.tuple([z.string()]),
  (_ctx, customerId) =>
    builder.arInvoice
      .where((q) => q.cmp("customerId", "=", customerId))
      .related("customer")
      .related("lineItems")
      .related("payments")
      .orderBy("invoiceDate", "desc"),
);

export const bankAccountWithTransactions = syncedQueryWithContext(
  "integration.bankAccountWithTransactions",
  z.tuple([z.string()]),
  (_ctx, accountId) =>
    builder.bankAccount
      .where((q) => q.cmp("id", "=", accountId))
      .related("transactions", (q) => q.orderBy("transactionDate", "desc").limit(50))
      .one(),
);

export const bankTransactionsByAccount = syncedQueryWithContext(
  "integration.bankTransactionsByAccount",
  z.tuple([z.string()]),
  (_ctx, accountId) =>
    builder.bankTransaction
      .where((q) => q.cmp("accountId", "=", accountId))
      .related("account")
      .orderBy("transactionDate", "desc")
      .limit(100),
);

// ============================================================================
// NEW PRODUCT & INVENTORY QUERIES
// ============================================================================

export const productCatalogWithCategories = syncedQueryWithContext(
  "integration.productCatalogWithCategories",
  z.tuple([z.string()]),
  (_ctx, catalogId) =>
    builder.productCatalog
      .where((q) => q.cmp("id", "=", catalogId))
      .related("categories", (q) => q.related("products"))
      .one(),
);

export const supplierWithProducts = syncedQueryWithContext(
  "integration.supplierWithProducts",
  z.tuple([z.string()]),
  (_ctx, supplierId) =>
    builder.supplier
      .where((q) => q.cmp("id", "=", supplierId))
      .related("supplierProducts", (q) => q.related("product"))
      .related("purchaseOrders", (q) => q.orderBy("orderDate", "desc"))
      .one(),
);

export const purchaseOrderWithDetails = syncedQueryWithContext(
  "integration.purchaseOrderWithDetails",
  z.tuple([z.string()]),
  (_ctx, poId) =>
    builder.purchaseOrder
      .where((q) => q.cmp("id", "=", poId))
      .related("supplier")
      .related("lineItems", (q) => q.related("product"))
      .related("receivingNotes")
      .one(),
);

// ============================================================================
// NEW SUPPORT & KB QUERIES
// ============================================================================

export const kbArticlesByCategory = syncedQueryWithContext(
  "integration.kbArticlesByCategory",
  z.tuple([z.string()]),
  (_ctx, categoryId) =>
    builder.kbArticle
      .where((q) => q.cmp("categoryId", "=", categoryId))
      .related("category")
      .related("author")
      .orderBy("publishedAt", "desc"),
);

export const kbArticleWithTags = syncedQueryWithContext(
  "integration.kbArticleWithTags",
  z.tuple([z.string()]),
  (_ctx, articleId) =>
    builder.kbArticle
      .where((q) => q.cmp("id", "=", articleId))
      .related("category")
      .related("author")
      .related("tags", (q) => q.related("tag"))
      .one(),
);

export const supportTicketsByStatus = syncedQueryWithContext(
  "integration.supportTicketsByStatus",
  z.tuple([z.string()]),
  (_ctx, statusId) =>
    builder.newSupportTicket
      .where((q) => q.cmp("statusId", "=", statusId))
      .related("customer")
      .related("status")
      .related("priority")
      .related("assignee")
      .orderBy("createdAt", "desc"),
);

export const supportTicketWithResponses = syncedQueryWithContext(
  "integration.supportTicketWithResponses",
  z.tuple([z.string()]),
  (_ctx, ticketId) =>
    builder.newSupportTicket
      .where((q) => q.cmp("id", "=", ticketId))
      .related("responses", (q) => q.related("responder").orderBy("responseDate", "asc"))
      .related("customer")
      .related("status")
      .related("priority")
      .one(),
);

// ============================================================================
// NEW COMMUNICATION QUERIES
// ============================================================================

export const chatChannelWithMessages = syncedQueryWithContext(
  "integration.chatChannelWithMessages",
  z.tuple([z.string()]),
  (_ctx, channelId) =>
    builder.chatChannel
      .where((q) => q.cmp("id", "=", channelId))
      .related("messages", (q) => q.related("sender").orderBy("createdAt", "asc").limit(100))
      .related("members", (q) => q.related("user"))
      .one(),
);

export const chatMessagesByChannel = syncedQueryWithContext(
  "integration.chatMessagesByChannel",
  z.tuple([z.string()]),
  (_ctx, channelId) =>
    builder.chatMessage
      .where((q) => q.cmp("channelId", "=", channelId))
      .related("sender")
      .related("channel")
      .orderBy("createdAt", "asc")
      .limit(100),
);

// ============================================================================
// COMPLEX CROSS-MODULE QUERIES
// ============================================================================

export const workspaceOverview = syncedQueryWithContext(
  "integration.workspaceOverview",
  z.tuple([z.string()]),
  (_ctx, workspaceId) =>
    builder.workspace
      .where((q) => q.cmp("id", "=", workspaceId))
      .related("memberships", (q) => q.related("user").limit(10))
      .related("apiKeys", (q) => q.limit(5))
      .related("auditLogs", (q) => q.related("user").orderBy("createdAt", "desc").limit(20))
      .one(),
);

export const employeeFullProfile = syncedQueryWithContext(
  "integration.employeeFullProfile",
  z.tuple([z.string()]),
  (_ctx, employeeId) =>
    builder.hrEmployee
      .where((q) => q.cmp("id", "=", employeeId))
      .related("user")
      .related("department", (q) => q.related("head"))
      .related("manager")
      .related("timeOffRequests", (q) => q.related("policy").orderBy("startDate", "desc").limit(10))
      .related("reviews", (q) => q.related("reviewer").related("cycle").orderBy("reviewDate", "desc").limit(5))
      .related("salaryHistory", (q) => q.orderBy("effectiveDate", "desc").limit(5))
      .one(),
);

export const customerFinancialSummary = syncedQueryWithContext(
  "integration.customerFinancialSummary",
  z.tuple([z.string()]),
  (_ctx, customerId) =>
    builder.arCustomer
      .where((q) => q.cmp("id", "=", customerId))
      .related("invoices", (q) => 
        q.related("lineItems").related("payments").orderBy("invoiceDate", "desc").limit(20)
      )
      .related("paymentTerms")
      .one(),
);
