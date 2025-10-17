import { syncedQuery } from "@rocicorp/zero";
import { builder } from "./zero-schema.gen";

export const allUsers = syncedQuery(
  "noConfig.allUsers",
  undefined,
  () => builder.user.orderBy("id", "asc"),
);

export const filtersWithChildren = syncedQuery(
  "noConfig.filtersWithChildren",
  undefined,
  (rootId: string) =>
    builder.filters
      .where((q) => q.cmp("id", "=", rootId))
      .related("children", (q) => q.related("children").orderBy("id", "asc")),
);

export const messagesBySender = syncedQuery(
  "noConfig.messagesBySender",
  undefined,
  (senderId: string) =>
    builder.message
      .where((q) => q.cmp("senderId", "=", senderId))
      .orderBy("id", "asc"),
);

export const messagesByBody = syncedQuery(
  "noConfig.messagesByBody",
  undefined,
  (body: string) =>
    builder.message
      .where((q) => q.cmp("body", "=", body))
      .orderBy("id", "asc"),
);

export const messageWithRelations = syncedQuery(
  "noConfig.messageWithRelations",
  undefined,
  (id: string) =>
    builder.message
      .where((q) => q.cmp("id", "=", id))
      .related("medium")
      .related("sender")
      .one(),
);

export const messageById = syncedQuery(
  "noConfig.messageById",
  undefined,
  (id: string) =>
    builder.message.where((q) => q.cmp("id", "=", id)).one(),
);

export const mediumById = syncedQuery(
  "noConfig.mediumById",
  undefined,
  (id: string) =>
    builder.medium.where((q) => q.cmp("id", "=", id)).one(),
);

export const allTypesById = syncedQuery(
  "noConfig.allTypesById",
  undefined,
  (id: string) =>
    builder.allTypes.where((q) => q.cmp("id", "=", id)).one(),
);
