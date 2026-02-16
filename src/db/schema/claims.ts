import {
  pgTable,
  uuid,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { claimStatusEnum } from './enums.js';
import { users } from './users.js';
import { items } from './items.js';

export const claims = pgTable('claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemId: uuid('item_id')
    .references(() => items.id, { onDelete: 'cascade' })
    .notNull(),
  claimantId: uuid('claimant_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  description: text('description').notNull(),
  proofImageUrl: text('proof_image_url'),
  status: claimStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});