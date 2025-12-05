import {zeroDrizzleConfig} from '../../src';
import * as oneToManyMissingNamed from './one-to-many-missing-named.schema';

export const schema = zeroDrizzleConfig(oneToManyMissingNamed, {
  tables: {
    users: {
      id: true,
      name: true,
    },
    posts: {
      id: true,
      content: true,
      authorId: true,
      reviewerId: true,
    },
  },
});
