-- The old ingest endpoint used a check-then-insert duplicate check (no DB
-- constraint), so concurrent requests could already have written rows with
-- the same content_hash. Clear the hash on all but the oldest row in each
-- collision group so the unique index below can be created without failing;
-- the duplicate rows themselves are left in place for the admin to review.
WITH duplicates AS (
  SELECT id, row_number() OVER (PARTITION BY content_hash ORDER BY created_at ASC) AS rn
  FROM "pending_products"
  WHERE content_hash IS NOT NULL
)
UPDATE "pending_products"
SET content_hash = NULL
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);--> statement-breakpoint
DROP INDEX "pending_hash_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "pending_hash_idx" ON "pending_products" USING btree ("content_hash") WHERE "pending_products"."content_hash" is not null;