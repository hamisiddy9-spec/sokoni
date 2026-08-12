import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/lib/utils";
import type { ProductWithImages } from "@/lib/types";

export default function ProductCard({ product }: { product: ProductWithImages }) {
  const image = product.images?.[0];
  const hasDiscount =
    product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🛍️</div>
        )}
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
            -{Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice!)) * 100)}%
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-gray-800/80 px-2.5 py-1 text-xs font-semibold text-white">
            Sold out
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-medium text-emerald-600">{product.vendor?.storeName || "Sokoni"}</p>
        <h3 className="clamp-2 mt-1 text-sm font-semibold text-gray-900 group-hover:text-emerald-700">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">{formatMoney(product.price, product.currency)}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatMoney(product.compareAtPrice!, product.currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
