import { drizzleZeroConfig } from "../../src";
import * as oneToManyParentChild from "./one-to-many-parent-child.schema";

export const schema = drizzleZeroConfig(oneToManyParentChild, {
  tables: {
    filters: {
      id: true,
      name: true,
      parentId: true,
    },
  },
});
