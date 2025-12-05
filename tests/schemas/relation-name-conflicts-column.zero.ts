import { zeroDrizzleConfig } from "../../src";
import * as relationNameConflictsColumn from "./relation-name-conflicts-column.schema";

export const schema = zeroDrizzleConfig(relationNameConflictsColumn, {
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
