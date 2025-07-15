import { drizzleZeroConfig } from "../../src";
import * as manyToMany from "./many-to-many.schema";

export const schema = drizzleZeroConfig(manyToMany, {
  tables: {
    users: {
      id: true,
      name: false,
    },
    usersToGroups: false,
    groups: false,
  },
});
