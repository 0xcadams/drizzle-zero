import { zeroDrizzleConfig } from "../../src";
import * as oneToOne from "./one-to-one.schema";

export const schema = zeroDrizzleConfig(oneToOne, {
  tables: {
    users: {
      id: true,
      name: true,
    },
    profileInfo: false,
  },
});
