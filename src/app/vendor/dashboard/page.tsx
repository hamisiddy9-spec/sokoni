import Link from "next/link";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { Package, Boxes, CheckCircle2, Plus, Store, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { vendors, products, productImages, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils";
import { dbSafe } from "@/lib/db-safe";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Badge, { statusTone } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
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

  // Find vendor by user email (v1 mapping) — DB-safe
  const vendorData = await dbSafe(
    async () => {
      const userRow = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email!))
        .limit(1);
      if (!userRow[0]) return { vendor: null as any, products: [] as any[] };

      const vendorRows = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userRow[0].id))
        .limit(1);
      const vendor = vendorRows[0] || null;
      if (!vendor) return { vendor: null, products: [] };

      const myProducts = await db
        .select()
        .from(products)
        .where(eq(products.vendorId, vendor.id))
        .orderBy(desc(products.createdAt));

      const productIds = myProducts.map((p) => p.id);
      const imgs =
        productIds.length > 0
          ? await db
              .select()
              .from(productImages)
              .where(inArray(productImages.productId, productIds))
          : [];

      return {
        vendor,
        products: myProducts.map((p) => ({
          ...p,
          images: imgs.filter((i) => i.productId === p.id),
        })),
      };
    },
    { vendor: null, products: [] }
  );

  const vendor = vendorData.vendor;
  const myProducts = vendorData.products;

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

  const categories = await getCategories().catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        title={vendor.storeName}
        description={
          <>
            Status:{" "}
            <Badge tone={statusTone(vendor.status)}>{vendor.status}</Badge>
            {" · "}
            <Link href={`/products?vendor=${vendor.slug}`} className="text-emerald-600 hover:underline">
              View store
            </Link>
          </>
        }
        action={
          <Link
            href="/vendor/dashboard?new=1"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Add product
          </Link>
        }
      />

      {vendor.status !== "approved" && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ⏳ Duka lako linakaguliwa na admin. Ukishaidhinishwa utaweza kuweka bidhaa na kuanza kuuza.
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Bidhaa" value={myProducts.length} icon={Package} tone="emerald" hint="Total products" />
        <StatCard
          label="Active"
          value={myProducts.filter((p) => p.status === "active").length}
          icon={CheckCircle2}
          tone="blue"
          hint="Live on store"
        />
        <StatCard
          label="Jumla ya stock"
          value={myProducts.reduce((s, p) => s + p.stock, 0)}
          icon={Boxes}
          tone="violet"
          hint="Units available"
        />
      </div>

      {/* New product form */}
      <VendorProductForm categories={categories} />

      {/* Products table */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900">Bidhaa zako</h2>
        {myProducts.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Package}
              title="Huna bidhaa bado"
              description={'Bonyeza "+ Add product" kuanza kuuza.'}
              action={
                <Link
                  href="/vendor/dashboard?new=1"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" /> Add product
                </Link>
              }
            />
          </div>
        ) : (
          <Card className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Bidhaa</th>
                    <th className="px-5 py-3 font-semibold">Price</th>
                    <th className="px-5 py-3 font-semibold">Stock</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Sales</th>
                    <th className="px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {myProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {p.images?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-lg">🛍️</div>
                            )}
                          </div>
                          <Link
                            href={`/products/${p.slug}`}
                            className="font-semibold text-gray-900 hover:text-emerald-600"
                          >
                            {p.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-gray-900">
                        {formatMoney(p.price, p.currency)}
                      </td>
                      <td className="px-5 py-3 text-gray-700">{p.stock}</td>
                      <td className="px-5 py-3">
                        <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{p.salesCount}</td>
                      <td className="px-5 py-3">
                        <ProductStatusToggle productId={p.id} status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
