import { zeroDrizzleConfig } from "../../src";
import * as manyToManySelfReferentialFk from "./many-to-many-self-referential-fk.schema";

export const schema = zeroDrizzleConfig(manyToManySelfReferentialFk, {
  tables: {
    doc: {
      id: true,
      title: true,
    },
    related: {
      fk_from_doc: true,
      fk_to_doc: true,
    },
  },
  manyToMany: {
    doc: {
      related_docs: [
        {
          sourceField: ["id"],
          destTable: "related",
          destField: ["fk_from_doc"],
        },
        {
          sourceField: ["fk_to_doc"],
          destTable: "doc",
          destField: ["id"],
        },
      ],
    },
  },
});
