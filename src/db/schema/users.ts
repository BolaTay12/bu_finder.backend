import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  universityId: varchar('university_id', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('STUDENT').notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});