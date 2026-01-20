import {defineRelations} from 'drizzle-orm';
import {jsonb, pgTable, text, varchar} from 'drizzle-orm/pg-core';
import type {ReadonlyJSONObject, ReadonlyJSONValue} from '@rocicorp/zero';

// ============================================
// Complex Type Definitions for $type<> testing
// ============================================

// 1. Nested object within object
export type NestedAddress = {
  street: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
};

export type UserProfile = {
  displayName: string;
  avatar: string | null;
  address: NestedAddress;
  preferences: {
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
};

// 2. Discriminated union
export type NotificationEvent =
  | {type: 'email'; recipient: string; subject: string; body: string}
  | {type: 'sms'; phoneNumber: string; message: string}
  | {type: 'push'; deviceToken: string; title: string; payload: Record<string, string>};

// 3. Complex generic-like structure with arrays
export type FormFieldConfig = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date';
  required: boolean;
  validation: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: Array<{value: string; label: string}>;
  };
  conditionalRules: Array<{
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: string | number | boolean;
    action: 'show' | 'hide' | 'require' | 'disable';
  }>;
};

// 4. Recursive-like structure (workflow with steps that can have substeps)
export type WorkflowStep = {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignee: string | null;
  dueDate: number | null;
  metadata: ReadonlyJSONObject;
  // Using ReadonlyJSONValue for recursive-like structure
  substeps: ReadonlyJSONValue;
};

// 5. ReadonlyJSONObject alias (like in user's real schema)
export type JsonObject = ReadonlyJSONObject;
export type RecordData = JsonObject;

// ============================================
// Table Definitions
// ============================================

export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  email: text('email').notNull(),
  // Complex nested object type
  profile: jsonb('profile').$type<UserProfile>(),
});

export const notifications = pgTable('notifications', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id),
  // Discriminated union type
  event: jsonb('event').$type<NotificationEvent>().notNull(),
  createdAt: text('created_at').notNull(),
});

export const formTemplates = pgTable('form_templates', {
  id: varchar('id').primaryKey(),
  name: text('name').notNull(),
  // Array of complex objects
  fields: jsonb('fields').$type<FormFieldConfig[]>().notNull(),
});

export const workflows = pgTable('workflows', {
  id: varchar('id').primaryKey(),
  name: text('name').notNull(),
  // Complex object with ReadonlyJSONValue for recursive-like data
  currentStep: jsonb('current_step').$type<WorkflowStep>(),
});

export const records = pgTable('records', {
  id: varchar('id').primaryKey(),
  tableId: varchar('table_id').notNull(),
  // Type alias chain: RecordData -> JsonObject -> ReadonlyJSONObject
  data: jsonb('data').$type<RecordData>().notNull(),
});

export const relations = defineRelations({users, notifications}, r => ({
  users: {
    notifications: r.many.notifications({
      from: r.users.id,
      to: r.notifications.userId,
    }),
  },
  notifications: {
    user: r.one.users({
      from: r.notifications.userId,
      to: r.users.id,
    }),
  },
}));
