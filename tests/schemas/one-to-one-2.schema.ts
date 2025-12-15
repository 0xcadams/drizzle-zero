import type {SQL} from 'drizzle-orm/_relations';
import {relations} from 'drizzle-orm/_relations';
import {
  boolean,
  customType,
  pgTable,
  text,
  type Precision,
} from 'drizzle-orm/pg-core';

const customColumnType = customType<{
  data: Date;
  driverData: string;
  config: {precision: Precision; withTimezone: boolean};
}>({
  dataType(config) {
    const precision = config !== undefined ? ` (${config.precision})` : '';
    const timezone =
      config !== undefined
        ? config.withTimezone
          ? ' with time zone'
          : ' without time zone'
        : '';

    return `timestamp${precision}${timezone}`;
  },
  fromDriver(value: string): Date {
    return new Date(value);
  },
  toDriver(value: Date | SQL): string | SQL {
    if (value && 'toISOString' in value) {
      return value.toISOString();
    }
    return value;
  },
});

export const userTable = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  partner: boolean('partner').notNull(),
  createdAt: customColumnType('created_at').notNull(),
});

export const userRelations = relations(userTable, ({many}) => ({
  messages: many(messageTable),
}));

export const mediumTable = pgTable('medium', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const mediumRelations = relations(mediumTable, ({many}) => ({
  messages: many(messageTable),
}));

export const messageTable = pgTable('message', {
  id: text('id').primaryKey(),
  senderId: text('senderId').references(() => userTable.id),
  mediumId: text('mediumId').references(() => mediumTable.id),
  body: text('body').notNull(),
});

export const messageRelations = relations(messageTable, ({one}) => ({
  medium: one(mediumTable, {
    fields: [messageTable.mediumId],
    references: [mediumTable.id],
  }),
  sender: one(userTable, {
    fields: [messageTable.senderId],
    references: [userTable.id],
  }),
}));
