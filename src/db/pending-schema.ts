import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { products } from "./schema";

/* ============================================================
   SOKONI — WhatsApp ingestion (product getting)
   Products zinazotoka kwenye WhatsApp groups → pending → live
   ============================================================ */

/**
 * Pending products kutoka WhatsApp.
 * Bot ina-ingest hapa; admin anathibitisha (approve) → inakuwa
 * product live kwenye `products` table.
 */
export const pendingProducts = pgTable(
  "pending_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // === Source info (group/channel + seller) ===
    sourceGroupId: varchar("source_group_id", { length: 120 }), // whatsapp group id (e.g. 123456-789@g.us)
    sourceGroupName: varchar("source_group_name", { length: 200 }), // jina la group
    sellerName: varchar("seller_name", { length: 150 }), // jina la muuzaji
    sellerPhone: varchar("seller_phone", { length: 40 }), // namba ya muuzaji (e.g. 2557xxxxxxxx@c.us)
    messageId: varchar("message_id", { length: 120 }), // whatsapp message id (kwa reservation reference)
    postedAt: timestamp("posted_at", { withTimezone: true }), // wakati alipost

    // === Product data (raw kutoka message) ===
    rawText: text("raw_text"), // text yote ya message
    images: jsonb("images"), // array ya image URLs (zime-download na ku-stored)
    make: varchar("make", { length: 100 }), // AI-extracted (e.g. "Toyota", "Samsung")
    model: varchar("model", { length: 150 }), // AI-extracted (e.g. "Corolla 2018", "Galaxy S22")
    price: decimal("price", { precision: 12, scale: 2 }), // bei (TZS au USD — currency field)
    currency: varchar("currency", { length: 8 }).notNull().default("TZS"),
    suggestedName: varchar("suggested_name", { length: 255 }), // AI-generated title
    suggestedDescription: text("suggested_description"), // AI-generated description
    suggestedCategory: varchar("suggested_category", { length: 120 }), // AI-suggested category
    aiConfidence: integer("ai_confidence").notNull().default(0), // 0-100

    // === Status flow ===
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | approved | rejected | duplicate
    reviewedBy: varchar("reviewed_by", { length: 120 }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    // Duplicate detection: hash ya image + text
    contentHash: varchar("content_hash", { length: 64 }),

    // === Reservation (order inapokuja) ===
    reservationStatus: varchar("reservation_status", { length: 20 }).notNull().default("none"), // none | reserved | confirmed | released
    reservationUntil: timestamp("reservation_until", { withTimezone: true }),
    reservationOrderId: uuid("reservation_order_id"),
    reservedFor: varchar("reserved_for", { length: 150 }), // jina/phone ya mteja

    // === Link to live product ===
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("pending_status_idx").on(t.status),
    index("pending_group_idx").on(t.sourceGroupId),
    uniqueIndex("pending_hash_idx")
      .on(t.contentHash)
      .where(sql`${t.contentHash} is not null`),
  ]
);

export const pendingProductsRelations = relations(pendingProducts, ({ one }) => ({
  product: one(products, { fields: [pendingProducts.productId], references: [products.id] }),
}));
