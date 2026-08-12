import Link from "next/link";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { vendors, products, productImages, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils";
import ProductStatusToggle from "@/components/ProductStatusToggle";
import VendorProductForm from "@/components/VendorProductForm";
import { getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Vendor dashboard" };

export default async function VendorDashboardPage() {
  const user = await getCurrentUser();

  // Not logged in
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">🔐</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Ingia kwanza</h1>
        <p className="mt-2 text-gray-500">Unahitaji account ya vendor kuona dashboard.</p>
        <Link
          href="/auth"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  // Find vendor by user email (v1 mapping)
  const userRow = await db
    .select()
    .from(users)
    .where(eq(users.email, user.email!))
    .limit(1);
  const vendor = userRow[0]
    ? (
        await db
          .select()
          .from(vendors)
          .where(eq(vendors.userId, userRow[0].id))
          .limit(1)
      )[0]
    : undefined;

  // No vendor yet — show CTA
  if (!vendor) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">🏪</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Fungua duka lako</h1>
        <p className="mt-2 text-gray-500">
          {user.email} — huna duka bado. Sajili duka lako kuanza kuuza kwenye Sokoni.
        </p>
        <Link
          href="/vendor/register"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Register duka →
        </Link>
      </div>
    );
  }

  const myProducts = await db
    .select()
    .from(products)
    .where(eq(products.vendorId, vendor.id))
    .orderBy(desc(products.createdAt));

  // Attach images
  const productIds = myProducts.map((p) => p.id);
  const images =
    productIds.length > 0
      ? await db
          .select()
          .from(productImages)
          .where(sql`${productImages.productId} = ANY(${productIds})`)
      : [];
  const productsWithImages = myProducts.map((p) => ({
    ...p,
    images: images.filter((i) => i.productId === p.id),
  }));

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{vendor.storeName}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Status:{" "}
            <span
              className={`font-semibold ${
                vendor.status === "approved"
                  ? "text-emerald-600"
                  : vendor.status === "pending"
                    ? "text-amber-600"
                    : "text-red-600"
              }`}
            >
              {vendor.status}
            </span>
            {" · "}
            <Link href={`/products?vendor=${vendor.slug}`} className="text-emerald-600 hover:underline">
              View store
            </Link>
          </p>
        </div>
        <Link
          href="/vendor/dashboard?new=1"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
        >
          + Add product
        </Link>
      </div>

      {vendor.status !== "approved" && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ⏳ Duka lako linakaguliwa na admin. Ukishaidhinishwa utaweza kuweka bidhaa na kuanza kuuza.
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Bidhaa</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{myProducts.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Active</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {myProducts.filter((p) => p.status === "active").length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Jumla ya stock</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {myProducts.reduce((s, p) => s + p.stock, 0)}
          </p>
        </div>
      </div>

      {/* New product form */}
      <VendorProductForm categories={categories} />

      {/* Products table */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900">Bidhaa zako</h2>
        {productsWithImages.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-4xl">📦</p>
            <p className="mt-3 text-gray-500">Huna bidhaa bado. Bonyeza "+ Add product" kuanza.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-4 py-3">Bidhaa</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Sales</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {productsWithImages.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/products/${p.slug}`}
                        className="font-semibold text-gray-900 hover:text-emerald-600"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatMoney(p.price, p.currency)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          p.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : p.status === "draft"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{p.salesCount}</td>
                    <td className="px-4 py-3">
                      <ProductStatusToggle productId={p.id} status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
