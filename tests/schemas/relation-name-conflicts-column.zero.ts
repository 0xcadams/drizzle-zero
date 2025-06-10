import { ANYONE_CAN, definePermissions, type Schema } from "@rocicorp/zero";
import { drizzleZeroConfig } from "../../src";
import * as relationNameConflictsColumn from "./relation-name-conflicts-column.schema";

export const schema = drizzleZeroConfig(relationNameConflictsColumn, {
  tables: {
    users: {
      id: true,
      name: true,
      posts: true, // This column exists and will conflict with the relationship name
    },
    posts: {
      id: true,
      content: true,
      authorId: true,
    },
  },
});

export const permissions = definePermissions<{}, Schema>(schema, () => {
  return {
    users: {
      row: {
        select: ANYONE_CAN,
        insert: ANYONE_CAN,
        update: {
          preMutation: ANYONE_CAN,
          postMutation: ANYONE_CAN,
        },
        delete: ANYONE_CAN,
      },
    },
    posts: {
      row: {
        select: ANYONE_CAN,
        insert: ANYONE_CAN,
        update: {
          preMutation: ANYONE_CAN,
          postMutation: ANYONE_CAN,
        },
        delete: ANYONE_CAN,
      },
    },
  };
}); 