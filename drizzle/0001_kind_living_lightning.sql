CREATE TABLE "pending_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_group_id" varchar(120),
	"source_group_name" varchar(200),
	"seller_name" varchar(150),
	"seller_phone" varchar(40),
	"message_id" varchar(120),
	"posted_at" timestamp with time zone,
	"raw_text" text,
	"images" jsonb,
	"make" varchar(100),
	"model" varchar(150),
	"price" numeric(12, 2),
	"currency" varchar(8) DEFAULT 'TZS' NOT NULL,
	"suggested_name" varchar(255),
	"suggested_description" text,
	"suggested_category" varchar(120),
	"ai_confidence" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar(120),
	"reviewed_at" timestamp with time zone,
	"content_hash" varchar(64),
	"reservation_status" varchar(20) DEFAULT 'none' NOT NULL,
	"reservation_until" timestamp with time zone,
	"reservation_order_id" uuid,
	"reserved_for" varchar(150),
	"product_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pending_products" ADD CONSTRAINT "pending_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pending_status_idx" ON "pending_products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pending_group_idx" ON "pending_products" USING btree ("source_group_id");--> statement-breakpoint
CREATE INDEX "pending_hash_idx" ON "pending_products" USING btree ("content_hash");