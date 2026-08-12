"use server";

import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { vendors, products, productImages, users } from "@/db/schema";
import { slugify } from "@/lib/utils";
import { getCurrentUser } from "@/lib/supabase/server";
import { z } from "zod";

/** Create vendor profile (called after Supabase signup). */
export async function registerVendor(input: {
  storeName: string;
  description?: string;
  country?: string;
  city?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Ingia kwanza.");

  const slug = `${slugify(input.storeName)}-${Math.random().toString(36).slice(2, 6)}`;

  const existing = await db
    .select()
    .from(vendors)
    .where(eq(vendors.slug, slug))
    .limit(1);
  if (existing[0]) throw new Error("Duka hili limesajiliwa tayari.");

  // Insert vendor row — find/create the users row for this auth user
  let userRow = await db.select().from(users).where(eq(users.email, user.email!)).limit(1);
  let userId: string;
  if (userRow[0]) {
    userId = userRow[0].id;
  } else {
    const [created] = await db
      .insert(users)
      .values({ email: user.email!, name: input.storeName, role: "vendor" })
      .returning();
    userId = created.id;
  }

  await db.insert(vendors).values({
    userId,
    storeName: input.storeName,
    slug,
    description: input.description || null,
    country: input.country || null,
    city: input.city || null,
    status: "pending",
  });

  revalidatePath("/vendor");
  return { ok: true, slug };
}

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.string().min(1),
  compareAtPrice: z.string().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  categoryId: z.string().optional(),
  sku: z.string().optional(),
  isVirtual: z.coerce.boolean().default(false),
  images: z.array(z.string()).default([]),
});

/** Get the vendor record for the current user (null if none). */
export async function getMyVendor() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Map supabase auth id -> users.id via email (simplified for v1)
  const userRow = await db
    .select()
    .from(users)
    .where(eq(users.email, user.email!))
    .limit(1);
  if (!userRow[0]) return null;

  return db.select().from(vendors).where(eq(vendors.userId, userRow[0].id)).limit(1);
}

export async function createProduct(input: z.infer<typeof productSchema>) {
  const vendor = await getMyVendor();
  if (!vendor?.[0]) throw new Error("Weka duka lako kwanza.");
  if (vendor[0].status !== "approved") throw new Error("Duka lako halijaidhinishwa bado.");

  const parsed = productSchema.parse(input);
  const slug = `${slugify(parsed.name)}-${Math.random().toString(36).slice(2, 6)}`;

  const [product] = await db
    .insert(products)
    .values({
      vendorId: vendor[0].id,
      categoryId: parsed.categoryId || null,
      name: parsed.name,
      slug,
      description: parsed.description || null,
      shortDescription: parsed.shortDescription || null,
      price: parsed.price,
      compareAtPrice: parsed.compareAtPrice || null,
      stock: parsed.stock,
      sku: parsed.sku || null,
      isVirtual: parsed.isVirtual,
      status: "active",
    })
    .returning();

  for (const [i, url] of parsed.images.entries()) {
    await db.insert(productImages).values({
      productId: product.id,
      url,
      sortOrder: i,
    });
  }

  revalidatePath("/vendor/dashboard");
  return { ok: true, product };
}

export async function updateProductStatus(productId: string, status: "draft" | "active" | "archived") {
  const vendor = await getMyVendor();
  if (!vendor?.[0]) throw new Error("Unauthorized");

  const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product[0] || product[0].vendorId !== vendor[0].id) throw new Error("Unauthorized");

  await db.update(products).set({ status }).where(eq(products.id, productId));
  revalidatePath("/vendor/dashboard");
  return { ok: true };
}
