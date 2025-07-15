import { drizzleZeroConfig } from "../../src";
import * as manyToManyForeignKey from "./many-to-many-missing-foreign-key.schema";

export const schema = drizzleZeroConfig(manyToManyForeignKey, {
  tables: {
    users: {
      id: true,
      name: true,
    },
    groups: {
      id: true,
      name: true,
    },
    usersToGroups: {
      userId: true,
      groupId: true,
    },
  },
  debug: true,
});
