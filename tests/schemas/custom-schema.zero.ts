import {zeroDrizzleConfig} from '../../src';
import * as customSchema from './custom-schema.schema';

export const schema = zeroDrizzleConfig(customSchema, {
  tables: {
    users: {
      id: true,
      name: true,
      invitedBy: true,
    },
  },
  debug: true,
});
