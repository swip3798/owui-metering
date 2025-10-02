import { index, int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  email: text().notNull(),
  role: text().notNull()
});

export const activityTable = sqliteTable(
  'activities',
  {
    id: text().primaryKey().notNull(),
    timestamp: int().notNull(),
    user_id: text().notNull(),
    model: text().notNull(),
    prompt_token: int().notNull(),
    completion_token: int().notNull(),
    reasoning_token: int(),
    cost: real().notNull(),
    cached_tokens: int(),
    provider: text(),
    reason: text()
  },
  (table) => [index('timestamp_idx').on(table.timestamp)]
);

export const pendingGenerationsTable = sqliteTable('pending_generations', {
  id: text().primaryKey().notNull(),
  user_id: text().notNull(),
  timestamp: int().notNull()
});
