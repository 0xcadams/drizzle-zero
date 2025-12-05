import { zeroDrizzleConfig } from "../../src";
import * as oneToManyMissingOne from "./one-to-many-missing-one.schema";

export const schema = zeroDrizzleConfig(oneToManyMissingOne, {
  tables: {
    users: {
      id: true,
      name: true,
    },
    posts: {
      id: true,
      content: true,
      authorId: true,
    },
  },
});
