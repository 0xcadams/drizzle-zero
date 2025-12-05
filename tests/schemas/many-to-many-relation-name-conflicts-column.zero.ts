import {zeroDrizzleConfig} from '../../src';
import * as manyToManyConflicts from './many-to-many-relation-name-conflicts-column.schema';

export const schema = zeroDrizzleConfig(manyToManyConflicts, {
  tables: {
    users: {
      id: true,
      name: true,
      groups: true, // This column will conflict with the many-to-many relationship name
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
      groups: ['usersToGroups', 'groups'], // This will conflict with the 'groups' column
    },
  },
});
