import { syncedQueryWithContext } from "@rocicorp/zero";
import { z } from "zod";
import { builder } from "./zero-schema.gen";

export const allUsers = syncedQueryWithContext(
  "noConfig.allUsers",
  z.tuple([]),
  (_ctx) => builder.user.orderBy("id", "asc"),
);

export const filtersWithChildren = syncedQueryWithContext(
  "noConfig.filtersWithChildren",
  z.tuple([z.string()]),
  (_ctx, rootId) =>
    builder.filters
      .where((q) => q.cmp("id", "=", rootId))
      .related("children", (q) => q.related("children").orderBy("id", "asc")),
);

export const messagesBySender = syncedQueryWithContext(
  "noConfig.messagesBySender",
  z.tuple([z.string()]),
  (_ctx, senderId) =>
    builder.message
      .where((q) => q.cmp("senderId", "=", senderId))
      .orderBy("id", "asc"),
);

export const messagesByBody = syncedQueryWithContext(
  "noConfig.messagesByBody",
  z.tuple([z.string()]),
  (_ctx, body) =>
    builder.message.where((q) => q.cmp("body", "=", body)).orderBy("id", "asc"),
);

export const messageWithRelations = syncedQueryWithContext(
  "noConfig.messageWithRelations",
  z.tuple([z.string()]),
  (_ctx, id) =>
    builder.message
      .where((q) => q.cmp("id", "=", id))
      .related("medium")
      .related("sender")
      .one(),
);

export const messageById = syncedQueryWithContext(
  "noConfig.messageById",
  z.tuple([z.string()]),
  (_ctx, id) => builder.message.where((q) => q.cmp("id", "=", id)).one(),
);

export const mediumById = syncedQueryWithContext(
  "noConfig.mediumById",
  z.tuple([z.string()]),
  (_ctx, id) => builder.medium.where((q) => q.cmp("id", "=", id)).one(),
);

export const allTypesById = syncedQueryWithContext(
  "noConfig.allTypesById",
  z.tuple([z.string()]),
  (_ctx, id) => builder.allTypes.where((q) => q.cmp("id", "=", id)).one(),
);

export const complexOrderWithEverything = syncedQueryWithContext(
  "integration.complexOrderWithEverything",
  z.tuple([z.string()]),
  (_ctx, orderId) =>
    builder.orderTable
      .where((q) => q.cmp("id", "=", orderId))
      .related("customer", (q) =>
        q.related("messages", (q2) =>
          q2
            .related("medium", (q3) =>
              q3.related("messages", (q4) =>
                q4.related("sender").related("medium").orderBy("id", "asc"),
              ),
            )
            .related("sender", (q3) => q3.related("messages"))
            .orderBy("id", "asc"),
        ),
      )
      .related("opportunity", (q) =>
        q
          .related("account", (q2) =>
            q2
              .related("owner", (q3) => q3.related("messages"))
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
                      .related("performer", (q5) => q5.related("messages"))
                      .related("account", (q5) =>
                        q5.related("opportunities").related("contacts"),
                      )
                      .orderBy("id", "asc"),
                  )
                  .related("notes", (q4) =>
                    q4
                      .related("author", (q5) => q5.related("messages"))
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
                      .related("performer", (q5) => q5.related("messages"))
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
                      .related("changedBy", (q5) => q5.related("messages"))
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
                  .related("performer")
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
                  .related("author", (q4) => q4.related("messages"))
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
              .related("changedBy")
              .orderBy("id", "asc"),
          ),
      )
      .related("items", (q) =>
        q
          .related("order", (q2) =>
            q2
              .related("customer", (q3) => q3.related("messages"))
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
              .related("customer", (q3) => q3.related("messages"))
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
              .related("customer", (q3) => q3.related("messages"))
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
                      .related("customer", (q5) => q5.related("messages"))
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
