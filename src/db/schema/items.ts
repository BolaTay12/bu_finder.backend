import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { itemTypeEnum, itemStatusEnum } from './enums';
import { users } from './users';

export const items = pgTable(
  'items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    category: varchar('category', { length: 100 }).notNull(),
    location: varchar('location', { length: 255 }).notNull(),
    type: itemTypeEnum('type').notNull(),
    status: itemStatusEnum('status').default('PENDING').notNull(),
    imageUrl: varchar('image_url', { length: 500 }),
    submittedBy: uuid('submitted_by')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    dateReported: timestamp('date_reported', { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_items_type').on(table.type),
    index('idx_items_status').on(table.status),
  ],
);