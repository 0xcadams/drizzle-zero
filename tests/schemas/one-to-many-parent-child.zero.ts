import { zeroDrizzleConfig } from "../../src";
import * as oneToManyParentChild from "./one-to-many-parent-child.schema";

export const schema = zeroDrizzleConfig(oneToManyParentChild, {
  tables: {
    filters: {
      id: true,
      name: true,
      parentId: true,
    },
  },
});
