DROP INDEX "idx_items_title_trgm";--> statement-breakpoint
DROP INDEX "idx_items_description_trgm";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;