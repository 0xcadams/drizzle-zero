import { drizzleZeroConfig } from "../../src";
import * as oneToOneMissingForeignKey from "./one-to-one-missing-foreign-key.schema";

export const schema = drizzleZeroConfig(oneToOneMissingForeignKey, {
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
