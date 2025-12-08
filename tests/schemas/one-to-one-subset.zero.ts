import {drizzleZeroConfig} from '../../src';
import * as oneToOne from './one-to-one.schema';

export const schema = drizzleZeroConfig(oneToOne, {
  tables: {
    users: {
      id: true,
      name: true,
    },
    profileInfo: false,
  },
});
