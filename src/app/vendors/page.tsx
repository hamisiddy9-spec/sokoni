import Link from "next/link";
import { getCategories, getVendors } from "@/lib/queries";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Vendors" };

export default async function VendorsPage() {
  const vendors = await getVendors(true);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
      <p className="mt-2 text-gray-500">
        Wauzaji wanaofanya kazi kwenye Sokoni — nunua moja kwa moja kutoka kwao.
      </p>

      {vendors.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-4xl">🏪</p>
          <p className="mt-3 text-gray-500">Hakuna vendors bado. Kuwa wa kwanza!</p>
          <Link
            href="/vendor"
            className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Become a vendor
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v) => (
            <Link
              key={v.id}
              href={`/products?vendor=${v.slug}`}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-2xl font-bold text-emerald-700">
                  {v.storeName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{v.storeName}</h3>
                  <p className="text-sm text-gray-500">
                    {v.city ? `${v.city}, ` : ""}
                    {v.country || "—"} · ⭐ {v.rating || "0"}
                  </p>
                </div>
              </div>
              <p className="clamp-3 mt-4 text-sm text-gray-600">{v.description || "—"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
