import { drizzleZeroConfig } from "../../src";
import * as oneToMany from "./one-to-many.schema";

export const schema = drizzleZeroConfig(oneToMany, {
  tables: {
    users: {
      id: true,
      name: true,
    },
    posts: {
      id: true,
      content: true,
      authorId: true,
    },
    comments: {
      id: true,
      text: true,
      postId: true,
      authorId: true,
    },
  },
});
