import { zeroDrizzleConfig } from "../../src";
import * as manyToMany from "./many-to-many.schema";

export const schema = zeroDrizzleConfig(manyToMany, {
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
  manyToMany: {
    users: {
      usersToGroups: [
        {
          sourceField: ["id"],
          destTable: "groups",
          destField: ["id"],
        },
        {
          sourceField: ["id"],
          destTable: "usersToGroups",
          // destField: "group_id", // missing field
        } as any,
      ],
    },
  },
});
