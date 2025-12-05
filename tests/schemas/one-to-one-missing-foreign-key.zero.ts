import { zeroDrizzleConfig } from "../../src";
import * as oneToOneMissingForeignKey from "./one-to-one-missing-foreign-key.schema";

export const schema = zeroDrizzleConfig(oneToOneMissingForeignKey, {
  tables: {
    users: {
      id: true,
      name: true,
    },
    posts: {
      id: true,
      name: true,
      author: true,
    },
  },
});
