"use server";

import { eq, and, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { carts, cartItems, products, productImages } from "@/db/schema";
import { generateSessionToken } from "@/lib/utils";

/**
 * Get-or-create a cart for the current session.
 * NOTE: hii inaweza ku-set cookie — tumia tu kwenye Server Actions
 * (Next 16 hairuhusu ku-set cookie wakati wa page render).
 */
export async function getOrCreateCart() {
  const cookieStore = await cookies();
  let token = cookieStore.get("sokoni_cart")?.value;

  if (!token) {
    token = generateSessionToken();
    cookieStore.set("sokoni_cart", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    await db.insert(carts).values({ sessionToken: token });
  }

  let cart = await db.select().from(carts).where(eq(carts.sessionToken, token)).limit(1);
  if (!cart[0]) {
    await db.insert(carts).values({ sessionToken: token });
    cart = await db.select().from(carts).where(eq(carts.sessionToken, token)).limit(1);
  }

  return { cart: cart[0], token };
}

/** Read-only cart lookup kwa page renders — haiseti cookies. */
export async function getCartReadOnly() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sokoni_cart")?.value;
  if (!token) return { cart: null as any, items: [] as any[], subtotal: 0 };

  const cart = await db.select().from(carts).where(eq(carts.sessionToken, token)).limit(1);
  if (!cart[0]) return { cart: null, items: [], subtotal: 0 };

  const items = await db
    .select({
      item: cartItems,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart[0].id));

  // Attach first image per product
  const productIds = items.map((r) => r.product.id);
  const imgs =
    productIds.length > 0
      ? await db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
      : [];
  const imgByProduct = new Map<string, any>();
  for (const im of imgs) {
    if (!imgByProduct.has(im.productId)) imgByProduct.set(im.productId, im);
  }

  const rows = items.map(({ item, product }) => ({
    ...item,
    product: {
      ...product,
      images: imgByProduct.get(product.id) ? [imgByProduct.get(product.id)] : [],
    },
  }));

  const subtotal = rows.reduce((sum, r) => sum + parseFloat(r.price) * r.quantity, 0);

  return { cart: cart[0], items: rows, subtotal };
}

export async function addToCart(productId: string, quantity = 1) {
  const { cart } = await getOrCreateCart();

  // Product must be active
  const product = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.status, "active")))
    .limit(1);
  if (!product[0]) throw new Error("Bidhaa haipatikani.");

  const qty = Math.max(1, Math.min(quantity, product[0].stock || 99));

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + qty, price: product[0].price })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({
      cartId: cart.id,
      productId,
      quantity: qty,
      price: product[0].price,
    });
  }

  revalidatePath("/cart");
  return { ok: true };
}

export async function updateCartItem(itemId: string, quantity: number) {
  const { cart } = await getOrCreateCart();
  if (quantity <= 0) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));
  } else {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));
  }
  revalidatePath("/cart");
  return { ok: true };
}

export async function removeCartItem(itemId: string) {
  const { cart } = await getOrCreateCart();
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));
  revalidatePath("/cart");
  return { ok: true };
}

export async function clearCart() {
  const { cart } = await getOrCreateCart();
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  revalidatePath("/cart");
  return { ok: true };
}
