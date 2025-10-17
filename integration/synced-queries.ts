import { syncedQuery } from "@rocicorp/zero";
import { builder } from "./zero-schema.gen";

export const allUsers = syncedQuery("integration.allUsers", undefined, () =>
  builder.user.orderBy("id", "asc"),
);

export const filtersWithChildren = syncedQuery(
  "integration.filtersWithChildren",
  undefined,
  (rootId: string) =>
    builder.filters
      .where((q) => q.cmp("id", "=", rootId))
      .related("children", (q) => q.related("children").orderBy("id", "asc")),
);

export const messagesBySender = syncedQuery(
  "integration.messagesBySender",
  undefined,
  (senderId: string) =>
    builder.message
      .where((q) => q.cmp("senderId", "=", senderId))
      .orderBy("id", "asc"),
);

export const messagesByBody = syncedQuery(
  "integration.messagesByBody",
  undefined,
  (body: string) =>
    builder.message.where((q) => q.cmp("body", "=", body)).orderBy("id", "asc"),
);

export const messageWithRelations = syncedQuery(
  "integration.messageWithRelations",
  undefined,
  (id: string) =>
    builder.message
      .where((q) => q.cmp("id", "=", id))
      .related("medium")
      .related("sender")
      .one(),
);

export const userWithMediums = syncedQuery(
  "integration.userWithMediums",
  undefined,
  (id: string) =>
    builder.user
      .where((q) => q.cmp("id", "=", id))
      .related("mediums")
      .one(),
);

export const userWithFriends = syncedQuery(
  "integration.userWithFriends",
  undefined,
  (id: string) =>
    builder.user
      .where((q) => q.cmp("id", "=", id))
      .related("friends")
      .one(),
);

export const messageById = syncedQuery(
  "integration.messageById",
  undefined,
  (id: string) => builder.message.where((q) => q.cmp("id", "=", id)).one(),
);

export const mediumById = syncedQuery(
  "integration.mediumById",
  undefined,
  (id: string) => builder.medium.where((q) => q.cmp("id", "=", id)).one(),
);

export const allTypesById = syncedQuery(
  "integration.allTypesById",
  undefined,
  (id: string) => builder.allTypes.where((q) => q.cmp("id", "=", id)).one(),
);

export const allTypesByStatus = syncedQuery(
  "integration.allTypesByStatus",
  undefined,
  (status: "active" | "inactive" | "pending") =>
    builder.allTypes.where((q) => q.cmp("status", "=", status)).one(),
);
