import {drizzleZeroConfig} from '../../src';
import * as manyToMany from './many-to-many.schema';

export const schema = drizzleZeroConfig(manyToMany, {
  tables: {
    users: {
      id: true,
      name: true,
    },
    groups: {
      id: true,
      name: true,
    },
    usersToGroups: {
      userId: true,
      groupId: true,
    },
  },
  manyToMany: {
    users: {
      groups: [
        {
          sourceField: ['id'],
          destTable: 'usersToGroups',
          destField: ['userId'],
        },
        {
          sourceField: ['groupId'],
          destTable: 'groups',
          destField: ['id'],
        },
      ],
    },
  },
});
