import { zeroDrizzleConfig } from "../../src";
import * as manyToMany from "./many-to-many.schema";

export const schema = zeroDrizzleConfig(manyToMany, {
  tables: {
    users: {
      id: true,
      name: false,
    },
    usersToGroups: false,
    groups: false,
  },
});
