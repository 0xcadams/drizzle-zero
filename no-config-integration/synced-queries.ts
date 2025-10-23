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
      .related("workspace", (q) =>
        q
          .related("members", (q2) =>
            q2
              .related("user", (q3) =>
                q3
                  .related("workspace")
                  .related("messages")
                  .related("friends")
                  .orderBy("id", "asc"),
              )
              .related("workspace", (q3) =>
                q3.related("apiKeys").related("members").orderBy("id", "asc"),
              )
              .orderBy("id", "asc"),
          )
          .related("apiKeys", (q2) =>
            q2.related("workspace").orderBy("id", "asc"),
          )
          .related("leads", (q2) =>
            q2
              .related("source", (q3) => q3.related("leads"))
              .related("workspace")
              .related("activities")
              .orderBy("id", "asc"),
          ),
      )
      .related("customer", (q) =>
        q
          .related("workspace", (q2) =>
            q2.related("members").related("apiKeys").related("leads"),
          )
          .related("employeeProfile", (q2) =>
            q2
              .related("user", (q3) =>
                q3.related("messages").related("workspace"),
              )
              .related("department", (q3) =>
                q3
                  .related("manager", (q4) =>
                    q4.related("employeeProfiles").related("messages"),
                  )
                  .related("teams", (q4) =>
                    q4.related("employees").related("lead"),
                  )
                  .related("employees", (q4) =>
                    q4.related("user").orderBy("id", "asc"),
                  ),
              )
              .related("team", (q3) =>
                q3
                  .related("department")
                  .related("lead")
                  .related("employees"),
              )
              .related("documents", (q3) =>
                q3.related("employee").related("uploadedBy"),
              )
              .related("timesheets", (q3) =>
                q3
                  .related("employee")
                  .related("entries", (q4) =>
                    q4.related("timesheet").related("task").orderBy("id", "asc"),
                  )
                  .orderBy("id", "asc"),
              ),
          )
          .related("ownedProjects", (q2) =>
            q2
              .related("owner", (q3) =>
                q3.related("workspace").related("messages"),
              )
              .related("phases", (q3) =>
                q3
                  .related("project")
                  .related("tasks", (q4) =>
                    q4
                      .related("phase")
                      .related("assignments")
                      .related("comments")
                      .orderBy("id", "asc"),
                  )
                  .orderBy("id", "asc"),
              )
              .related("tasks", (q3) =>
                q3
                  .related("project")
                  .related("phase")
                  .related("assignments", (q4) =>
                    q4.related("task").related("user").orderBy("id", "asc"),
                  )
                  .related("comments", (q4) =>
                    q4.related("task").related("author").orderBy("id", "asc"),
                  )
                  .related("attachments", (q4) =>
                    q4.related("task").orderBy("id", "asc"),
                  )
                  .related("tags", (q4) =>
                    q4.related("task").related("tag").orderBy("id", "asc"),
                  )
                  .orderBy("id", "asc"),
              )
              .related("notes", (q3) =>
                q3.related("project").related("author").orderBy("id", "asc"),
              )
              .related("audits", (q3) =>
                q3.related("project").related("actor").orderBy("id", "asc"),
              )
              .orderBy("id", "asc"),
          )
          .related("messages", (q2) =>
            q2
              .related("workspace", (q3) => q3.related("members"))
              .related("medium", (q3) =>
                q3
                  .related("workspace")
                  .related("messages", (q4) =>
                    q4.related("sender").related("medium").orderBy("id", "asc"),
                  ),
              )
              .related("sender", (q3) =>
                q3
                  .related("workspace")
                  .related("messages")
                  .related("friends"),
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
      .related("workspace", (q) =>
        q
          .related("members", (q2) =>
            q2.related("user").related("workspace").orderBy("id", "asc"),
          )
          .related("apiKeys", (q2) => q2.orderBy("id", "asc"))
          .related("leads", (q2) =>
            q2
              .related("source", (q3) => q3.related("leads"))
              .related("activities", (q3) =>
                q3.related("lead").related("assignedTo").orderBy("id", "asc"),
              )
              .orderBy("id", "asc"),
          )
          .related("hrDepartments", (q2) =>
            q2
              .related("workspace")
              .related("manager", (q3) =>
                q3.related("employeeProfiles").related("messages"),
              )
              .related("teams", (q3) =>
                q3
                  .related("department")
                  .related("lead")
                  .related("employees", (q4) =>
                    q4.related("user").orderBy("id", "asc"),
                  )
                  .orderBy("id", "asc"),
              )
              .related("employees", (q3) =>
                q3
                  .related("department")
                  .related("team")
                  .related("user")
                  .orderBy("id", "asc"),
              )
              .orderBy("id", "asc"),
          )
          .related("apVendors", (q2) =>
            q2
              .related("workspace")
              .related("invoices", (q3) =>
                q3
                  .related("vendor")
                  .related("payments", (q4) =>
                    q4.related("invoice").orderBy("id", "asc"),
                  )
                  .orderBy("id", "asc"),
              )
              .orderBy("id", "asc"),
          )
          .related("arCustomers", (q2) =>
            q2
              .related("workspace")
              .related("invoices", (q3) =>
                q3
                  .related("customer")
                  .related("payments", (q4) =>
                    q4.related("invoice").orderBy("id", "asc"),
                  )
                  .orderBy("id", "asc"),
              )
              .orderBy("id", "asc"),
          )
          .related("bankAccounts", (q2) =>
            q2
              .related("workspace")
              .related("transactions", (q3) =>
                q3.related("account").orderBy("id", "asc"),
              )
              .orderBy("id", "asc"),
          )
          .related("productSuppliers", (q2) =>
            q2
              .related("workspace")
              .related("products", (q3) =>
                q3
                  .related("supplier")
                  .related("category", (q4) => q4.related("products"))
                  .orderBy("id", "asc"),
              )
              .orderBy("id", "asc"),
          )
          .related("purchaseOrders", (q2) =>
            q2
              .related("workspace")
              .related("vendor")
              .related("lines", (q3) =>
                q3
                  .related("purchaseOrder")
                  .related("product", (q4) => q4.related("supplier"))
                  .orderBy("id", "asc"),
              )
              .orderBy("id", "asc"),
          )
          .related("kbCategories", (q2) =>
            q2
              .related("workspace")
              .related("articles", (q3) =>
                q3
                  .related("category")
                  .related("author")
                  .related("tags", (q4) =>
                    q4.related("article").related("tag").orderBy("id", "asc"),
                  )
                  .orderBy("id", "asc"),
              )
              .orderBy("id", "asc"),
          )
          .related("supportTickets", (q2) =>
            q2
              .related("workspace")
              .related("submitter", (q3) =>
                q3.related("messages").related("workspace"),
              )
              .related("assignee", (q3) =>
                q3.related("employeeProfile").related("workspace"),
              )
              .related("status", (q3) => q3.related("tickets"))
              .related("priority", (q3) => q3.related("tickets"))
              .related("responses", (q3) =>
                q3
                  .related("ticket")
                  .related("author")
                  .orderBy("id", "asc"),
              )
              .orderBy("id", "asc"),
          )
          .related("chatChannels", (q2) =>
            q2
              .related("workspace")
              .related("createdBy", (q3) =>
                q3.related("messages").related("workspace"),
              )
              .related("messages", (q3) =>
                q3
                  .related("channel")
                  .related("author")
                  .orderBy("id", "asc"),
              )
              .orderBy("id", "asc"),
          )
          .related("documentLibraries", (q2) =>
            q2
              .related("workspace")
              .related("owner")
              .related("folders", (q3) =>
                q3
                  .related("library")
                  .related("parent")
                  .related("files", (q4) =>
                    q4
                      .related("folder")
                      .related("versions", (q5) =>
                        q5.related("file").orderBy("id", "asc"),
                      )
                      .orderBy("id", "asc"),
                  )
                  .orderBy("id", "asc"),
              )
              .orderBy("id", "asc"),
          ),
      )
      .one(),
);
