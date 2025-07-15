import { number } from "@rocicorp/zero";
import { drizzleZeroConfig } from "../../src";
import * as oneToOne2 from "./one-to-one-2.schema";

export const schema = drizzleZeroConfig(oneToOne2, {
  tables: {
    userTable: {
      id: true,
      name: true,
      partner: true,
      createdAt: number().from("created_at"),
    },
    mediumTable: {
      id: true,
      name: true,
    },
    messageTable: {
      id: true,
      senderId: true,
      mediumId: true,
      body: true,
    },
  },
});
