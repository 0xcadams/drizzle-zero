import {drizzleZeroConfig} from '../../src';
import * as customSchema from './custom-schema.schema';

export const schema = drizzleZeroConfig(customSchema, {
  tables: {
    users: {
      id: true,
      name: true,
      invitedBy: true,
    },
  },
  debug: true,
});
