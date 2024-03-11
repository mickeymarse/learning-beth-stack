import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { pgTable, text, serial, boolean } from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  completed: boolean('completed').notNull().default(false),
});

type SelectTodo = typeof todos.$inferSelect;
type InsertTodo = typeof todos.$inferInsert;

type SelectTodo2 = InferSelectModel<typeof todos>;
type InsertTodo2 = InferInsertModel<typeof todos>;
