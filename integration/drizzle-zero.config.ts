import { drizzleZeroConfig } from "drizzle-zero";
import * as drizzleSchema from "drizzle-zero-db/schema";

export const schema = drizzleZeroConfig(drizzleSchema, {
  tables: {
    user: {
      createdAt: true,
      updatedAt: true,
      id: true,
      name: true,
      partner: true,
      email: true,
      customTypeJson: true,
      customInterfaceJson: true,
      testInterface: true,
      testType: true,
      testExportedType: true,
    },
    medium: {
      createdAt: true,
      updatedAt: true,
      id: true,
      name: true,
    },
    message: {
      createdAt: true,
      updatedAt: true,
      id: true,
      senderId: true,
      mediumId: true,
      body: true,
      metadata: true,
    },
    allTypes: true,
    friendship: true,
    filters: {
      id: true,
      name: true,
      parentId: true,
    },
  },
  manyToMany: {
    user: {
      mediums: ["message", "medium"],
      friends: [
        {
          sourceField: ["id"],
          destTable: "friendship",
          destField: ["requestingId"],
        },
        {
          sourceField: ["acceptingId"],
          destTable: "user",
          destField: ["id"],
        },
      ],
    },
  },
  casing: "snake_case",
});
