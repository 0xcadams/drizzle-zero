import {zeroDrizzleConfig} from '../../src';
import * as postgresSchemaCollision from './postgres-schema-collision.schema';

export const schema = zeroDrizzleConfig(postgresSchemaCollision, {
  tables: {
    authUsers: {
      id: true,
      name: true,
    },
    users: {
      id: true,
      name: true,
    },
    groups: {
      id: true,
      authUserId: true,
      userId: true,
    },
  },
});
