import "server-only";
import { eq, and, desc, asc, ilike, or, sql, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products, productImages, vendors, categories } from "@/db/schema";
import type { ProductWithImages } from "@/lib/types";

/** Attach images + vendor + category to product rows. */
export async function enrichProducts(rows: any[]): Promise<ProductWithImages[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const images = await db
    .select()
    .from(productImages)
    .where(inArray(productImages.productId, ids))
    .orderBy(productImages.sortOrder);
  const vendorIds = [...new Set(rows.map((r) => r.vendorId).filter(Boolean))];
  const vendorsRows =
    vendorIds.length > 0
      ? await db.select().from(vendors).where(inArray(vendors.id, vendorIds))
      : [];
  const catIds = [...new Set(rows.map((r) => r.categoryId).filter(Boolean))];
  const cats =
    catIds.length > 0
      ? await db.select().from(categories).where(inArray(categories.id, catIds))
      : [];

  return rows.map((r) => ({
    ...r,
    images: images.filter((i) => i.productId === r.id),
    vendor: vendorsRows.find((v) => v.id === r.vendorId) || null,
    category: cats.find((c) => c.id === r.categoryId) || null,
  }));
}

/** Active products, optionally filtered. */
export async function getProducts(opts: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  vendorSlug?: string;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  featuredOnly?: boolean;
} = {}) {
  const conds = [eq(products.status, "active")];
  if (opts.featuredOnly) conds.push(eq(products.featured, true));
  if (opts.search) {
    conds.push(
      or(ilike(products.name, `%${opts.search}%`), ilike(products.description ?? "", `%${opts.search}%`))!
    );
  }
  if (opts.categorySlug) {
    const cat = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, opts.categorySlug))
      .limit(1);
    if (cat[0]) conds.push(eq(products.categoryId, cat[0].id));
  }
  if (opts.vendorSlug) {
    const ven = await db.select().from(vendors).where(eq(vendors.slug, opts.vendorSlug)).limit(1);
    if (ven[0]) conds.push(eq(products.vendorId, ven[0].id));
  }

  const orderBy =
    opts.sort === "price_asc"
      ? asc(products.price)
      : opts.sort === "price_desc"
        ? desc(products.price)
        : opts.sort === "popular"
          ? desc(products.salesCount)
          : desc(products.createdAt);

  const rows = await db
    .select()
    .from(products)
    .where(and(...conds))
    .orderBy(orderBy)
    .limit(opts.limit ?? 24)
    .offset(opts.offset ?? 0);

  return enrichProducts(rows);
}

export async function getProductBySlug(slug: string): Promise<ProductWithImages | null> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, "active")))
    .limit(1);
  if (!rows[0]) return null;
  const enriched = await enrichProducts(rows);
  return enriched[0];
}

export async function getFeaturedProducts(limit = 8) {
  return getProducts({ featuredOnly: true, limit });
}

export async function getCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.sortOrder));
}

export async function getVendors(approvedOnly = true) {
  return db
    .select()
    .from(vendors)
    .where(approvedOnly ? eq(vendors.status, "approved") : undefined)
    .orderBy(desc(vendors.createdAt));
}
