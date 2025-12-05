import {zeroDrizzleConfig} from '../../src';
import * as noRelations from './no-relations.schema';

export const schema = zeroDrizzleConfig(noRelations, {
  tables: {
    users: {
      id: true,
      name: true,
    },
    profileInfo: {
      id: true,
      userId: true,
      metadata: true,
    },
  },
});
