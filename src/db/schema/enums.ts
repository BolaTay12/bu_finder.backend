import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'STUDENT',
  'STAFF',
  'ADMIN',
]);

export const itemTypeEnum = pgEnum('item_type', ['LOST', 'FOUND']);

export const itemStatusEnum = pgEnum('item_status', [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CLAIMED',
]);

export const claimStatusEnum = pgEnum('claim_status', [
  'PENDING',
  'APPROVED',
  'REJECTED',
]);