import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/queries";
import { formatMoney } from "@/lib/utils";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const images = product.images && product.images.length > 0 ? product.images : [];
  const hasDiscount =
    product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-emerald-600">Home</Link>
        {" / "}
        <Link href="/products" className="hover:text-emerald-600">Shop</Link>
        {product.category && (
          <>
            {" / "}
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-emerald-600"
            >
              {product.category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white border border-gray-200">
            {images[0] ? (
              <Image
                src={images[0].url}
                alt={images[0].alt || product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-8xl">🛍️</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <Image
                    src={img.url}
                    alt={img.alt || product.name}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.vendor && (
            <Link
              href={`/products?vendor=${product.vendor.slug}`}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              🏪 {product.vendor.storeName}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>

          {product.ratingCount > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              ⭐ {product.rating} ({product.ratingCount} reviews)
            </p>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900">
              {formatMoney(product.price, product.currency)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">
                {formatMoney(product.compareAtPrice!, product.currency)}
              </span>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">Stock:</span>{" "}
              {product.stock > 0 ? `${product.stock} available` : "Sold out"}
            </p>
            {product.isVirtual && (
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Type:</span> Digital product — instant delivery
              </p>
            )}
          </div>

          <div className="mt-6">
            <AddToCartButton productId={product.id} stock={product.stock} />
          </div>

          {product.shortDescription && (
            <p className="mt-6 text-gray-600">{product.shortDescription}</p>
          )}
          {product.description && (
            <div className="prose prose-sm mt-4 max-w-none text-gray-700">
              <h3 className="text-base font-bold text-gray-900">Description</h3>
              <p className="whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
