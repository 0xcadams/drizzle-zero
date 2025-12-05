import {foreignKey, pgTable, primaryKey, text} from 'drizzle-orm/pg-core';
import {relations} from 'drizzle-orm/relations';

export const doc = pgTable('doc', {
  id: text().primaryKey().notNull(),
  title: text().notNull(),
});

export const related = pgTable(
  'related',
  {
    fk_from_doc: text().notNull(),
    fk_to_doc: text().notNull(),
  },
  table => [
    foreignKey({
      columns: [table.fk_from_doc],
      foreignColumns: [doc.id],
      name: 'related_fk_from_doc',
    }),
    foreignKey({
      columns: [table.fk_to_doc],
      foreignColumns: [doc.id],
      name: 'related_fk_to_doc',
    }),
    primaryKey({
      columns: [table.fk_from_doc, table.fk_to_doc],
      name: 'related_pkey',
    }),
  ],
);

export const relatedRelations = relations(related, ({one}) => ({
  doc_fk_from_doc: one(doc, {
    fields: [related.fk_from_doc],
    references: [doc.id],
    relationName: 'related_fk_from_doc_doc_id',
  }),
  doc_fk_to_doc: one(doc, {
    fields: [related.fk_to_doc],
    references: [doc.id],
    relationName: 'related_fk_to_doc_doc_id',
  }),
}));

export const docRelations = relations(doc, ({many}) => ({
  relateds_fk_from_doc: many(related, {
    relationName: 'related_fk_from_doc_doc_id',
  }),
  relateds_fk_to_doc: many(related, {
    relationName: 'related_fk_to_doc_doc_id',
  }),
}));
