import { drizzleZeroConfig } from "../../src";
import * as oneToOneForeignKey from "./one-to-one-foreign-key.schema";

export const schema = drizzleZeroConfig(oneToOneForeignKey, {
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
