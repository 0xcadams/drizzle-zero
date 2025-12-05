import {zeroDrizzleConfig} from '../../src';
import * as manyToManySelfReferential from './many-to-many-self-referential.schema';

export const schema = zeroDrizzleConfig(manyToManySelfReferential, {
  tables: {
    user: {
      id: true,
      name: true,
    },
    friendship: {
      requestingId: true,
      acceptingId: true,
      accepted: true,
    },
  },
  manyToMany: {
    user: {
      friends: [
        {
          sourceField: ['id'],
          destTable: 'friendship',
          destField: ['requestingId'],
        },
        {
          sourceField: ['acceptingId'],
          destTable: 'user',
          destField: ['id'],
        },
      ],
    },
  },
});
