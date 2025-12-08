import {drizzleZeroConfig} from '../../src';
import * as oneToManyNamed from './one-to-many-named.schema';

export const schema = drizzleZeroConfig(oneToManyNamed, {
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
