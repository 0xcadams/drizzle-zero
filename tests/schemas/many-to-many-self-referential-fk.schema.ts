import {foreignKey, pgTable, primaryKey, text} from 'drizzle-orm/pg-core';
import {defineRelations} from 'drizzle-orm';

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

export const relations = defineRelations({doc, related}, r => ({
  related: {
    doc_fk_from_doc: r.one.doc({
      from: r.related.fk_from_doc,
      to: r.doc.id,
      alias: 'related_fk_from_doc_doc_id',
    }),
    doc_fk_to_doc: r.one.doc({
      from: r.related.fk_to_doc,
      to: r.doc.id,
      alias: 'related_fk_to_doc_doc_id',
    }),
  },
  doc: {
    relateds_fk_from_doc: r.many.related({alias: 'related_fk_from_doc_doc_id'}),
    relateds_fk_to_doc: r.many.related({alias: 'related_fk_to_doc_doc_id'}),
  },
}));
