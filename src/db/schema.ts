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
import { relations } from "drizzle-orm";

/* ============================================================
   SOKONI — Multi-vendor marketplace schema
   Ported from Ecommerce-CodeIgniter-Bootstrap (MIT) → Drizzle
   ============================================================ */

/* ---------- Users & Auth ---------- */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  authId: uuid("auth_id").unique(), // Supabase auth.users id
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 120 }),
  phone: varchar("phone", { length: 40 }),
  role: varchar("role", { length: 20 }).notNull().default("customer"), // customer | vendor | admin
  language: varchar("language", { length: 8 }).notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  vendor: many(vendors),
  orders: many(orders),
  cartItems: many(cartItems),
  reviews: many(reviews),
}));

/* ---------- Vendors (multi-vendor core) ---------- */
export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  storeName: varchar("store_name", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | approved | suspended
  country: varchar("country", { length: 80 }),
  city: varchar("city", { length: 80 }),
  payoutEmail: varchar("payout_email", { length: 255 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, { fields: [vendors.userId], references: [users.id] }),
  products: many(products),
}));

/* ---------- Categories (tree, like original) ---------- */
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, { onDelete: "set null" }),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    description: text("description"),
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => []
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
  children: many(categories),
  products: many(products),
}));

/* ---------- Products ---------- */
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 280 }).notNull().unique(),
    description: text("description"),
    shortDescription: varchar("short_description", { length: 500 }),
    price: decimal("price", { precision: 12, scale: 2 }).notNull().default("0"),
    compareAtPrice: decimal("compare_at_price", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 8 }).notNull().default("USD"),
    stock: integer("stock").notNull().default(0),
    sku: varchar("sku", { length: 80 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"), // draft | active | archived
    isVirtual: boolean("is_virtual").notNull().default(false), // digital product
    downloadUrl: text("download_url"),
    attributes: jsonb("attributes"), // e.g. {"color": ["red","blue"]}
    featured: boolean("featured").notNull().default(false),
    salesCount: integer("sales_count").notNull().default(0),
    rating: decimal("rating", { precision: 3, scale: 2 }).notNull().default("0"),
    ratingCount: integer("rating_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("product_status_idx").on(t.status, t.featured),
    index("product_category_idx").on(t.categoryId),
    index("product_vendor_idx").on(t.vendorId),
  ]
);

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(vendors, { fields: [products.vendorId], references: [vendors.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

/* ---------- Product images ---------- */
export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 255 }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

/* ---------- Cart ---------- */
export const carts = pgTable(
  "carts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionToken: varchar("session_token", { length: 120 }), // guest carts
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("cart_session_idx").on(t.sessionToken)]
);

export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(), // snapshot at add time
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

/* ---------- Orders ---------- */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: varchar("order_number", { length: 30 }).notNull().unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | paid | shipped | delivered | cancelled
    subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
    discount: decimal("discount", { precision: 12, scale: 2 }).notNull().default("0"),
    shipping: decimal("shipping", { precision: 12, scale: 2 }).notNull().default("0"),
    tax: decimal("tax", { precision: 12, scale: 2 }).notNull().default("0"),
    total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
    currency: varchar("currency", { length: 8 }).notNull().default("USD"),
    paymentMethod: varchar("payment_method", { length: 30 }),
    paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("unpaid"), // unpaid | paid | failed | refunded
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 120 }),
    shippingAddress: jsonb("shipping_address"),
    billingAddress: jsonb("billing_address"),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 40 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("order_user_idx").on(t.userId),
    index("order_status_idx").on(t.status),
  ]
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 255 }).notNull(), // snapshot
  productImage: text("product_image"),
  quantity: integer("quantity").notNull().default(1),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(), // snapshot
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  vendor: one(vendors, { fields: [orderItems.vendorId], references: [vendors.id] }),
}));

/* ---------- Discount codes ---------- */
export const discounts = pgTable("discounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull().default("percent"), // percent | fixed
  value: decimal("value", { precision: 10, scale: 2 }).notNull().default("0"),
  minSubtotal: decimal("min_subtotal", { precision: 12, scale: 2 }),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const discountsRelations = relations(discounts, ({ many }) => ({
  usages: many(discountUsages),
}));

export const discountUsages = pgTable("discount_usages", {
  id: uuid("id").primaryKey().defaultRandom(),
  discountId: uuid("discount_id").notNull().references(() => discounts.id, { onDelete: "cascade" }),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------- Reviews ---------- */
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title", { length: 200 }),
  comment: text("comment"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

/* ---------- Translations (multi-language) ---------- */
export const translations = pgTable("translations", {
  id: uuid("id").primaryKey().defaultRandom(),
  lang: varchar("lang", { length: 8 }).notNull(),
  key: varchar("key", { length: 120 }).notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("translations_lang_key_idx").on(t.lang, t.key),
]);

/* ---------- Indexes (moved into pgTable definitions above) ---------- */
