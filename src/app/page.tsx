import Link from "next/link";
import { getFeaturedProducts, getCategories } from "@/lib/queries";
import ProductGrid from "@/components/ProductGrid";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(8), getCategories()]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              🏪 Multi-vendor marketplace
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              Nunua. Uze. <span className="text-emerald-200">Sokoni.</span>
            </h1>
            <p className="mt-5 text-lg text-emerald-50/90 sm:text-xl">
              Marketplace ya kisasa — vendors wengi, bidhaa za kipekee, malipo salama.
              Soko lako moja kwa moja mtandaoni.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-lg transition-transform hover:scale-105"
              >
                Shop now →
              </Link>
              <Link
                href="/vendor"
                className="rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Become a vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories strip */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-emerald-600 hover:text-emerald-600"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Featured products</h2>
          <Link href="/products" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            View all →
          </Link>
        </div>
        <ProductGrid products={featured} emptyMessage="Featured products zitakuja hivi karibuni." />
      </section>

      {/* How it works */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">Jinsi Sokoni inavyofanya kazi</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { icon: "🛍️", title: "Nunua", desc: "Vinjari bidhaa kutoka vendors mbalimbali, weka kwenye cart." },
              { icon: "💳", title: "Lipa salama", desc: "Malipo kwa kadi kupitia Stripe — salama na ya haraka." },
              { icon: "🚚", title: "Pokea", desc: "Fuatilia order zako na upokee bidhaa moja kwa moja." },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
                <p className="text-4xl">{s.icon}</p>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
