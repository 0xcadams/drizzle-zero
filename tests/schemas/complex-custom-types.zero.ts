import {drizzleZeroConfig} from '../../src';
import * as drizzleSchema from './complex-custom-types.schema';

export const schema = drizzleZeroConfig(drizzleSchema, {
  tables: {
    users: {
      id: true,
      email: true,
      profile: true,
    },
    notifications: {
      id: true,
      userId: true,
      event: true,
      createdAt: true,
    },
    formTemplates: {
      id: true,
      name: true,
      fields: true,
    },
    workflows: {
      id: true,
      name: true,
      currentStep: true,
    },
    records: {
      id: true,
      tableId: true,
      data: true,
    },
  },
});

export type Schema = typeof schema;
