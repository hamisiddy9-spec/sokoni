"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { pendingProducts } from "@/db/pending-schema";
import { products, productImages, vendors } from "@/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

/** Approve pending product → inakuwa live product. */
export async function approvePendingProduct(
  pendingId: string,
  input: {
    name: string;
    description?: string;
    price: string;
    currency?: string;
    categoryId?: string;
    stock?: number;
  }
) {
  const user = await getCurrentUser();
  if (!user || user.email !== "admin@sokoni.app") throw new Error("Unauthorized");

  const pending = await db
    .select()
    .from(pendingProducts)
    .where(eq(pendingProducts.id, pendingId))
    .limit(1);
  if (!pending[0]) throw new Error("Pending product haipatikani.");

  // Find default vendor (Sokoni Digital — inventory holder)
  const vendor = await db
    .select()
    .from(vendors)
    .where(eq(vendors.slug, "sokoni-digital"))
    .limit(1);
  if (!vendor[0]) {
    throw new Error(
      "Default vendor 'sokoni-digital' haipatikani. Tengeneza vendor hiyo kwanza kabla ya ku-approve."
    );
  }

  const slug = `${slugify(input.name)}-${Math.random().toString(36).slice(2, 5)}`;
  const images: string[] = Array.isArray(pending[0].images) ? (pending[0].images as string[]) : [];

  const product = await db.transaction(async (tx) => {
    const [product] = await tx
      .insert(products)
      .values({
        vendorId: vendor[0].id,
        categoryId: input.categoryId || null,
        name: input.name,
        slug,
        description:
          input.description !== undefined
            ? input.description || null
            : pending[0].suggestedDescription || null,
        shortDescription: input.name.slice(0, 120),
        price: input.price,
        currency: input.currency || pending[0].currency || "TZS",
        stock: input.stock ?? 1,
        status: "active",
        isVirtual: false,
      })
      .returning();

    // Copy images kutoka pending
    if (images.length > 0) {
      await tx.insert(productImages).values(
        images.map((url, i) => ({ productId: product.id, url, sortOrder: i }))
      );
    }

    // Mark pending as approved + link product
    await tx
      .update(pendingProducts)
      .set({
        status: "approved",
        productId: product.id,
        reviewedAt: new Date(),
        reviewedBy: user.email,
        updatedAt: new Date(),
      })
      .where(eq(pendingProducts.id, pendingId));

    return product;
  });

  revalidatePath("/admin/pending");
  revalidatePath("/products");
  return { ok: true, productId: product.id, slug };
}

/** Reject pending product (sio bidhaa, duplicate, n.k.) */
export async function rejectPendingProduct(pendingId: string) {
  const user = await getCurrentUser();
  if (!user || user.email !== "admin@sokoni.app") throw new Error("Unauthorized");

  await db
    .update(pendingProducts)
    .set({
      status: "rejected",
      reviewedAt: new Date(),
      reviewedBy: user.email,
      updatedAt: new Date(),
    })
    .where(eq(pendingProducts.id, pendingId));

  revalidatePath("/admin/pending");
  return { ok: true };
}
