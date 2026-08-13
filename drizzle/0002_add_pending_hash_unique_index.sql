DROP INDEX "pending_hash_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "pending_hash_idx" ON "pending_products" USING btree ("content_hash") WHERE "pending_products"."content_hash" is not null;