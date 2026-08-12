import Link from "next/link";
import { getProducts, getCategories } from "@/lib/queries";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export const metadata = { title: "Shop" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const vendor = typeof sp.vendor === "string" ? sp.vendor : undefined;
  const search = typeof sp.q === "string" ? sp.q : undefined;
  const sort = typeof sp.sort === "string" ? (sp.sort as any) : undefined;

  const [products, categories] = await Promise.all([
    getProducts({ categorySlug: category, vendorSlug: vendor, search, sort, limit: 48 }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 md:w-56">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">Categories</h2>
          <ul className="mt-3 space-y-1">
            <li>
              <Link
                href="/products"
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  !category ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All products
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                    category === cat.slug
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main */}
        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {search ? `Search: "${search}"` : category || "All products"}
              </h1>
              <p className="mt-1 text-sm text-gray-500">{products.length} bidhaa</p>
            </div>
            <form method="get" action="/products" className="flex gap-2">
              <input
                type="text"
                name="q"
                defaultValue={search}
                placeholder="Search products..."
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
              <select
                name="sort"
                defaultValue={sort || "newest"}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most popular</option>
                <option value="price_asc">Price: low → high</option>
                <option value="price_desc">Price: high → low</option>
              </select>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Filter
              </button>
            </form>
          </div>

          <ProductGrid
            products={products}
            emptyMessage="Hakuna bidhaa zinazolingana na filter zako."
          />
        </div>
      </div>
    </div>
  );
}
