import {relations} from 'drizzle-orm/_relations';
import {pgTable, text} from 'drizzle-orm/pg-core';

export const filters = pgTable('filter', {
  id: text('id').primaryKey(),
  name: text('name'),
  parentId: text('parent_id'),
});

export const filtersRelations = relations(filters, ({one, many}) => ({
  parent: one(filters, {
    fields: [filters.parentId],
    references: [filters.id],
  }),
  children: many(filters),
}));
