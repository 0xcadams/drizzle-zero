import {zeroDrizzleConfig} from '../../src';
import * as oneToOneForeignKey from './one-to-one-foreign-key.schema';

export const schema = zeroDrizzleConfig(oneToOneForeignKey, {
  tables: {
    users: {
      id: true,
      name: true,
    },
    posts: {
      id: true,
      name: true,
      author: true,
    },
  },
});
