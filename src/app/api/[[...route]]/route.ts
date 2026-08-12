import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { carts, cartItems, products, orders, orderItems, discounts, productImages } from "@/db/schema";
import { stripe, hasStripeConfig } from "@/lib/stripe";
import { generateOrderNumber, computeDiscount } from "@/lib/utils";

const app = new Hono().basePath("/api");

const checkoutSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z
    .object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  discountCode: z.string().optional(),
});

/**
 * POST /api/checkout
 * Creates an order + Stripe PaymentIntent. Returns clientSecret.
 */
app.post("/checkout", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid checkout data", details: parsed.error.flatten() }, 400);
    }
    const { email, name, phone, address, discountCode } = parsed.data;

    // Resolve cart from cookie
    const cookieHeader = c.req.header("cookie") || "";
    const tokenMatch = cookieHeader.match(/sokoni_cart=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    if (!token) return c.json({ error: "Cart haipatikani." }, 400);

    const cart = await db.select().from(carts).where(eq(carts.sessionToken, token)).limit(1);
    if (!cart[0]) return c.json({ error: "Cart haipatikani." }, 400);

  const rows = await db
    .select({
      item: cartItems,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart[0].id));

  if (rows.length === 0) return c.json({ error: "Cart iko tupu." }, 400);

  // Load images for cart products
  const productIds = rows.map((r) => r.product.id);
  const imgs =
    productIds.length > 0
      ? await db
          .select()
          .from(productImages)
          .where(sql`${productImages.productId} = ANY(${productIds})`)
      : [];
  const imgByProduct = new Map<string, string>();
  for (const im of imgs) {
    if (!imgByProduct.has(im.productId)) imgByProduct.set(im.productId, im.url);
  }

  // Validate stock + compute subtotal
  const lineItems = rows.map(({ item, product }) => {
    if (product.stock < item.quantity) {
      throw new Error(`Stock haitoshi kwa "${product.name}"`);
    }
    return {
      product,
      quantity: item.quantity,
      price: parseFloat(item.price),
      image: imgByProduct.get(product.id) || null,
    };
  });
    const subtotal = lineItems.reduce((s, li) => s + li.price * li.quantity, 0);

    // Discount
    let discountAmount = 0;
    let discountRow = null;
    if (discountCode) {
      const code = discountCode.trim().toUpperCase();
      discountRow = await db
        .select()
        .from(discounts)
        .where(and(eq(discounts.code, code), eq(discounts.active, true)))
        .limit(1);
      if (discountRow[0]) {
        const d = discountRow[0];
        const now = new Date();
        const expired = d.expiresAt && new Date(d.expiresAt) < now;
        const notStarted = d.startsAt && new Date(d.startsAt) > now;
        const maxed = d.maxUses !== null && d.usedCount >= d.maxUses;
        const belowMin = d.minSubtotal && subtotal < parseFloat(d.minSubtotal);
        if (!expired && !notStarted && !maxed && !belowMin) {
          discountAmount = computeDiscount(d.type as any, d.value, subtotal);
        }
      }
    }

    const total = Math.max(0, subtotal - discountAmount);

    if (!hasStripeConfig()) {
      // Dev mode: create order without payment
      const orderNumber = generateOrderNumber();
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber,
          email,
          phone,
          status: "pending",
          paymentStatus: "unpaid",
          subtotal: subtotal.toFixed(2),
          discount: discountAmount.toFixed(2),
          shipping: "0",
          tax: "0",
          total: total.toFixed(2),
          shippingAddress: address || null,
        })
        .returning();

      for (const li of lineItems) {
        await db.insert(orderItems).values({
          orderId: order.id,
          productId: li.product.id,
          vendorId: li.product.vendorId,
          productName: li.product.name,
          productImage: li.image,
          quantity: li.quantity,
          price: li.price.toFixed(2),
          total: (li.price * li.quantity).toFixed(2),
        });
        await db
          .update(products)
          .set({ stock: li.product.stock - li.quantity, salesCount: li.product.salesCount + li.quantity })
          .where(eq(products.id, li.product.id));
      }
      if (discountRow?.[0]) {
        await db
          .update(discounts)
          .set({ usedCount: discountRow[0].usedCount + 1 })
          .where(eq(discounts.id, discountRow[0].id));
      }
      await db.delete(cartItems).where(eq(cartItems.cartId, cart[0].id));

      return c.json({ mode: "dev", orderId: order.id, orderNumber, total });
    }

    // Stripe mode
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: { cartToken: token, discountCode: discountCode || "" },
    });

    // Create order in pending state
    const orderNumber = generateOrderNumber();
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        email,
        phone,
        status: "pending",
        paymentStatus: "unpaid",
        subtotal: subtotal.toFixed(2),
        discount: discountAmount.toFixed(2),
        shipping: "0",
        tax: "0",
        total: total.toFixed(2),
        paymentMethod: "stripe",
        stripePaymentIntentId: paymentIntent.id,
        shippingAddress: address || null,
      })
      .returning();

    for (const li of lineItems) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: li.product.id,
        vendorId: li.product.vendorId,
        productName: li.product.name,
        productImage: li.image,
        quantity: li.quantity,
        price: li.price.toFixed(2),
        total: (li.price * li.quantity).toFixed(2),
      });
    }

    return c.json({
      mode: "stripe",
      orderId: order.id,
      orderNumber,
      clientSecret: paymentIntent.client_secret,
      total,
    });
  } catch (err: any) {
    console.error("checkout error:", err);
    return c.json({ error: err?.message || "Checkout imeshindikana." }, 500);
  }
});

/**
 * POST /api/checkout/confirm
 * Called after Stripe payment succeeds — marks order paid, decrements stock,
 * clears cart.
 */
app.post("/checkout/confirm", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    const { orderId, paymentIntentId } = body || {};

    const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order[0]) return c.json({ error: "Order haipatikani." }, 404);

    if (paymentIntentId && order[0].stripePaymentIntentId !== paymentIntentId) {
      return c.json({ error: "Payment intent hailingani." }, 400);
    }

    await db
      .update(orders)
      .set({ status: "paid", paymentStatus: "paid", updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    // Decrement stock + bump sales
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
    for (const it of items) {
      if (it.productId) {
        const p = await db.select().from(products).where(eq(products.id, it.productId)).limit(1);
        if (p[0]) {
          await db
            .update(products)
            .set({
              stock: Math.max(0, p[0].stock - it.quantity),
              salesCount: p[0].salesCount + it.quantity,
            })
            .where(eq(products.id, it.productId));
        }
      }
    }

    // Clear cart
    const cookieHeader = c.req.header("cookie") || "";
    const tokenMatch = cookieHeader.match(/sokoni_cart=([^;]+)/);
    if (tokenMatch) {
      const cart = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionToken, decodeURIComponent(tokenMatch[1])))
        .limit(1);
      if (cart[0]) await db.delete(cartItems).where(eq(cartItems.cartId, cart[0].id));
    }

    return c.json({ ok: true, orderId, orderNumber: order[0].orderNumber });
  } catch (err: any) {
    console.error("confirm error:", err);
    return c.json({ error: err?.message || "Confirmation imeshindikana." }, 500);
  }
});

/**
 * GET /api/orders/:orderNumber
 * Public order lookup (for order tracking).
 */
app.get("/orders/:orderNumber", async (c) => {
  const orderNumber = c.req.param("orderNumber");
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);
  if (!order[0]) return c.json({ error: "Order haipatikani." }, 404);

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order[0].id));
  return c.json({ order: order[0], items });
});

/**
 * POST /api/webhooks/stripe
 * Stripe webhook — confirms payment server-side.
 */
app.post("/webhooks/stripe", async (c) => {
  const signature = c.req.header("stripe-signature");
  if (!signature) return c.json({ error: "Missing signature" }, 400);
  if (!hasStripeConfig() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return c.json({ error: "Webhook haijasanidiwa" }, 400);
  }

  const raw = await c.req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      raw,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    return c.json({ error: `Webhook signature invalid: ${err.message}` }, 400);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as any;
    // Find order by payment intent id
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, pi.id))
      .limit(1);
    if (order[0] && order[0].paymentStatus !== "paid") {
      await db
        .update(orders)
        .set({ status: "paid", paymentStatus: "paid", updatedAt: new Date() })
        .where(eq(orders.id, order[0].id));

      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order[0].id));
      for (const it of items) {
        if (it.productId) {
          const p = await db.select().from(products).where(eq(products.id, it.productId)).limit(1);
          if (p[0]) {
            await db
              .update(products)
              .set({
                stock: Math.max(0, p[0].stock - it.quantity),
                salesCount: p[0].salesCount + it.quantity,
              })
              .where(eq(products.id, it.productId));
          }
        }
      }

      const cartToken = pi.metadata?.cartToken;
      if (cartToken) {
        const cart = await db.select().from(carts).where(eq(carts.sessionToken, cartToken)).limit(1);
        if (cart[0]) await db.delete(cartItems).where(eq(cartItems.cartId, cart[0].id));
      }
    }
  }

  return c.json({ received: true });
});

export const GET = handle(app);
export const POST = handle(app);
