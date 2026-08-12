import Link from "next/link";
import { eq, desc, sql } from "drizzle-orm";
import { Package, Store } from "lucide-react";
import { db } from "@/db";
import { products, vendors, productImages } from "@/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils";
import { dbSafe } from "@/lib/db-safe";
import AdminLayout from "@/components/admin/AdminLayout";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge, { statusTone } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export const metadata = { title: "Products — Admin" };

export default async function AdminProductsPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.email === "admin@sokoni.app";

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">🔐</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Ingia kwanza</h1>
        <Link href="/auth" className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700">
          Sign in
        </Link>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">⛔</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Huna ruhusa</h1>
      </div>
    );
  }

  const data = await dbSafe(
    async () => {
      const rows = await db
        .select()
        .from(products)
        .orderBy(desc(products.createdAt))
        .limit(50);
      const vendorIds = [...new Set(rows.map((r) => r.vendorId))];
      const vendorRows =
        vendorIds.length > 0
          ? await db.select().from(vendors).where(sql`${vendors.id} = ANY(${vendorIds})`)
          : [];
      const productIds = rows.map((r) => r.id);
      const imgs =
        productIds.length > 0
          ? await db
              .select()
              .from(productImages)
              .where(sql`${productImages.productId} = ANY(${productIds})`)
          : [];
      return {
        products: rows.map((p) => ({
          ...p,
          vendor: vendorRows.find((v) => v.id === p.vendorId) || null,
          image: imgs.find((i) => i.productId === p.id)?.url || null,
        })),
      };
    },
    { products: [] }
  );

  return (
    <AdminLayout isAdmin={isAdmin} email={user.email}>
      <PageHeader
        title="Products"
        description="Bidhaa zote kwenye Sokoni"
      />

      <Card>
        {data.products.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Package}
              title="Hakuna bidhaa"
              description="Bidhaa zitaonekana hapa vendors wanapoziongeza."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Vendor</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold">Sales</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-lg">🛍️</div>
                          )}
                        </div>
                        <Link href={`/products/${p.slug}`} className="font-semibold text-gray-900 hover:text-emerald-600">
                          {p.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <Store className="h-3.5 w-3.5 text-gray-400" />
                        {p.vendor?.storeName || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-900">
                      {formatMoney(p.price, p.currency)}
                      {p.compareAtPrice && (
                        <span className="ml-1.5 text-xs font-normal text-gray-400 line-through">
                          {formatMoney(p.compareAtPrice, p.currency)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={p.stock === 0 ? "font-semibold text-red-600" : "text-gray-700"}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{p.salesCount}</td>
                    <td className="px-5 py-3">
                      <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
