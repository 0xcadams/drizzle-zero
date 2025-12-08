# drizzle-zero

Generate [Zero](https://zero.rocicorp.dev/) schemas from [Drizzle ORM](https://orm.drizzle.team) schemas.

## Installation

```bash
npm install drizzle-zero
# or
bun add drizzle-zero
# or
yarn add drizzle-zero
# or
pnpm add drizzle-zero
```

## Usage

Here's an example of how to convert a Drizzle schema to a Zero schema with bidirectional relationships:

### Define Drizzle schema

You should have an existing Drizzle schema, e.g.:

```ts
import {relations} from 'drizzle-orm';
import {pgTable, text, jsonb} from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  // custom types are supported for any column type!
  email: text('email').$type<`${string}@${string}`>().notNull(),
});

export const usersRelations = relations(users, ({many}) => ({
  posts: many(posts),
}));

export const posts = pgTable('post', {
  id: text('id').primaryKey(),
  // this JSON type will be passed to Zero
  content: jsonb('content').$type<{textValue: string}>().notNull(),
  authorId: text('author_id').references(() => users.id),
});

export const postsRelations = relations(posts, ({one}) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

See the [integration test's `schema.ts`](db/drizzle/schema.ts)
for more examples of how to define Drizzle schemas with custom types.

### Add schema generation script

You can then add the schema generation script to your `package.json`:

```json
{
  "scripts": {
    "generate": "drizzle-zero generate --format",
    "postinstall": "npm generate"
  }
}
```

This command will look for a Drizzle Kit config at `drizzle.config.ts` in the current directory
and use the Drizzle schema defined in it. _This must be a single TS file and
not a folder/glob for type resolution to work_. It will also use the
casing defined in your drizzle config.

You can change this behavior with `-s, --schema <input-file>`
as the path to your Drizzle schema file, or
`-k, --drizzle-kit-config <input-file>` with the path to your `drizzle.config.ts` file.

By default, it will output your schema to `zero-schema.gen.ts`.
You can customize the generated file path with `-o, --output <output-file>`.

If you have Prettier installed, you can use it to format the generated output
with `-f, --format`.

To specify a custom tsconfig file, use `-t, --tsconfig <tsconfig-file>`.
It will, by default, look for one in the current directory.

The CLI automatically detects whether `.js` file extensions are needed in import statements based on your tsconfig's `moduleResolution` setting. If you're using `"moduleResolution": "node16"` or `"nodenext"`, the generator will automatically add `.js` extensions to imports. You can override this behavior with `-j, --js-file-extension` if needed.

You can also control optional outputs from the generator:

- **--skip-types**: Skip generating table `Row[]` type exports.
- **--skip-builder**: Skip generating the query `builder` export.
- **--skip-declare**: Skip generating the module augmentation for default types in Zero.
- **--enable-legacy-mutators**: Enable legacy CRUD mutators (sets `enableLegacyMutators` to `true` in the generated schema).
- **--enable-legacy-queries**: Enable legacy CRUD queries (sets `enableLegacyQueries` to `true` in the generated schema).

For more information on disabling legacy mutators and queries, see the [Zero documentation](https://zero.rocicorp.dev/docs/custom-mutators#disabling-crud-mutators).

**Important:** the Drizzle schema **must be included in the tsconfig** for
type resolution to work. If they are not included, there will be an error similar to
`Failed to find type definitions`.

### Define Zero schema file

Use the generated Zero schema:

```tsx
import {useEffect, useState} from 'react';
import {useZero} from '@rocicorp/zero/react';
import {syncedQuery} from '@rocicorp/zero';
import {builder} from '../zero-schema.gen.ts';

const postsQuery = syncedQuery('allPosts', z.tuple([]), () =>
  builder.posts.related('author').limit(10),
);

function PostList() {
  const z = useZero();

  const [posts] = useQuery(postsQuery());

  return (
    <div>
      {posts.map(post => (
        <div key={post.id} className="post">
          {/* Access the JSON content from Drizzle */}
          <p>{post.content.textValue}</p>
          <p>By: {post.author?.name}</p>
          <p>Email: {post.author?.email}</p>
        </div>
      ))}
    </div>
  );
}
```

### Customize with `drizzle-zero.config.ts`

If you want to customize the tables/columns that are synced by Zero, you can optionally
create a new config file at `drizzle-zero.config.ts` specifying the tables and/or columns you want to
include in the CLI output:

> **Important:** The config file currently struggles with types for large schemas. In those cases,
> stick with the default CLI behavior.

```ts
import {drizzleZeroConfig} from 'drizzle-zero';
// directly glob import your original Drizzle schema w/ tables/relations
import * as drizzleSchema from './drizzle-schema';

// Define your configuration file for the CLI
export default drizzleZeroConfig(drizzleSchema, {
  // Specify which tables and columns to include in the Zero schema.
  // This allows for the "expand/migrate/contract" pattern recommended in the Zero docs.

  // All tables/columns must be defined, but can be omitted or set to false to exclude them from the Zero schema.
  // Column names match your Drizzle schema definitions
  tables: {
    // this can be set to false
    // e.g. users: false,
    users: {
      id: true,
      name: true,
      // omit columns to exclude them
      email: true,
    },
    posts: {
      // or this can be set to false
      // e.g. id: false,
      id: true,
      content: true,
      // Use the JavaScript field name (authorId), not the DB column name (author_id)
      authorId: true,
    },
  },

  // Specify the casing style to use for the schema.
  // This is useful for when you want to use a different casing style than the default.
  // This works in the same way as the `casing` option in the Drizzle ORM.
  //
  // @example
  // casing: "snake_case",
});
```

You can customize this config file path with `-c, --config <input-file>`.

**Important:** the `drizzle-zero.config.ts` file **must be included in the tsconfig**
for the type resolution to work. If they are not included, there will be an error similar to
`Failed to find type definitions`.

## Many-to-Many Relationships

drizzle-zero supports many-to-many relationships with a junction table. You can configure them in two ways:

### Simple Configuration

```ts
export default drizzleZeroConfig(drizzleSchema, {
  tables: {
    user: {
      id: true,
      name: true,
    },
    usersToGroup: {
      userId: true,
      groupId: true,
    },
    group: {
      id: true,
      name: true,
    },
  },
  manyToMany: {
    user: {
      // Simple format: [junction table, target table]
      groups: ['usersToGroup', 'group'],
    },
  },
});
```

Then query as usual, skipping the junction table:

```tsx
const userQuery = syncedQuery(
  z.query.user.where('id', '=', '1').related('groups').one(),
);

const [user] = useQuery(userQuery());

console.log(user);
// {
//   id: "user_1",
//   name: "User 1",
//   groups: [
//     { id: "group_1", name: "Group 1" },
//     { id: "group_2", name: "Group 2" },
//   ],
// }
```

### Extended Configuration

For more complex scenarios like self-referential relationships:

```ts
export default drizzleZeroConfig(drizzleSchema, {
  tables: {
    user: {
      id: true,
      name: true,
    },
    friendship: {
      requestingId: true,
      acceptingId: true,
    },
  },
  manyToMany: {
    user: {
      // Extended format with explicit field mappings
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
```

## Features

- Output static schemas from the CLI
- Convert Drizzle ORM schemas to Zero schemas
  - Sync a subset of tables and columns
- Handles all Drizzle column types that are supported by Zero
- Type-safe schema generation with inferred types from Drizzle
- Custom ZQL database adapter for using Drizzle in the same `tx` as Zero mutators
- Supports relationships:
  - One-to-one relationships
  - One-to-many relationships
  - Many-to-many relationships with simple or extended configuration
  - Self-referential relationships
- Handles custom schemas and column mappings
