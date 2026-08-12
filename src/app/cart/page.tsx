import Link from "next/link";
import Image from "next/image";
import { getCartReadOnly } from "@/app/actions/cart";
import CartItemControls from "@/components/CartItemControls";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const { items, subtotal } = await getCartReadOnly();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Cart yako iko tupu</h1>
        <p className="mt-2 text-gray-500">Ongeza bidhaa kwenye cart kuanza kununua.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Shop now →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Shopping cart</h1>
      <p className="mt-1 text-sm text-gray-500">{items.length} item(s)</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map(({ id, product, quantity, price }) => (
            <div
              key={id}
              className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4"
            >
              <Link href={`/products/${product.slug}`} className="shrink-0">
                <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
                  {product.images?.[0] ? (
                    <Image
                      src={(product as any).images[0].url}
                      alt={product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">🛍️</div>
                  )}
                </div>
              </Link>
              <div className="flex flex-1 flex-col">
                <Link
                  href={`/products/${product.slug}`}
                  className="font-semibold text-gray-900 hover:text-emerald-600"
                >
                  {product.name}
                </Link>
                <p className="mt-0.5 text-sm text-gray-500">{formatMoney(price, product.currency)} each</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <CartItemControls itemId={id} quantity={quantity} />
                  <span className="font-bold text-gray-900">
                    {formatMoney(parseFloat(price) * quantity, product.currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-gray-400">Calculated at checkout</span>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-extrabold text-gray-900">{formatMoney(subtotal)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block rounded-xl bg-emerald-600 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-emerald-700"
          >
            Checkout →
          </Link>
        </div>
      </div>
    </div>
  );
}
