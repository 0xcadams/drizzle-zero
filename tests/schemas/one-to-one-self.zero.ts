import { drizzleZeroConfig } from "../../src";
import * as oneToOneSelf from "./one-to-one-self.schema";

export const schema = drizzleZeroConfig(oneToOneSelf, {
  tables: {
    users: {
      id: true,
      name: true,
      invitedBy: true,
    },
  },
});
