import Link from "next/link";
import { eq, desc, sql, count } from "drizzle-orm";
import { db } from "@/db";
import { vendors, products, orders, users, discounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">🔐</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Ingia kwanza</h1>
        <Link
          href="/auth"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  // Admin check (v1: email-based)
  const isAdmin = user.email === "admin@sokoni.app";
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">⛔</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Huna ruhusa</h1>
        <p className="mt-2 text-gray-500">Admin pekee ndiye anayeweza kuona ukurasa huu.</p>
      </div>
    );
  }

  const [vendorCount, productCount, orderCount, revenueRows, pendingVendors, discountRows] =
    await Promise.all([
      db.select({ n: count() }).from(vendors),
      db.select({ n: count() }).from(products),
      db.select({ n: count() }).from(orders),
      db.select({ total: sql<string>`COALESCE(SUM(total), 0)` }).from(orders).where(eq(orders.paymentStatus, "paid")),
      db.select().from(vendors).where(eq(vendors.status, "pending")).orderBy(desc(vendors.createdAt)).limit(20),
      db.select().from(discounts).orderBy(desc(discounts.createdAt)).limit(20),
    ]);

  const revenue = parseFloat(revenueRows[0]?.total || "0");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Usimamizi wa Sokoni — vendors, bidhaa, orders, discounts.</p>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Vendors</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{vendorCount[0]?.n ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Bidhaa</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{productCount[0]?.n ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Orders</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{orderCount[0]?.n ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Revenue (paid)</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{formatMoney(revenue)}</p>
        </div>
      </div>

      {/* Pending vendors */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900">
          Vendors wanakosubiri uthibitisho{" "}
          {pendingVendors.length > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
              {pendingVendors.length}
            </span>
          )}
        </h2>
        {pendingVendors.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Hakuna vendors wanaosubiri.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {pendingVendors.map((v) => (
              <div
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div>
                  <p className="font-bold text-gray-900">{v.storeName}</p>
                  <p className="text-sm text-gray-500">
                    {v.city ? `${v.city}, ` : ""}
                    {v.country || "—"} · {v.description ? v.description.slice(0, 80) : "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/vendors?action=approve&id=${v.id}`}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    Approve
                  </Link>
                  <Link
                    href={`/admin/vendors?action=reject&id=${v.id}`}
                    className="rounded-lg border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discount codes */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900">Discount codes</h2>
        <Link
          href="/admin/discounts?new=1"
          className="mt-3 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
        >
          + Create discount code
        </Link>
        {discountRows.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Hakuna discount codes bado.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Uses</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {discountRows.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">{d.code}</td>
                    <td className="px-4 py-3">{d.type}</td>
                    <td className="px-4 py-3">
                      {d.type === "percent" ? `${d.value}%` : formatMoney(d.value)}
                    </td>
                    <td className="px-4 py-3">
                      {d.usedCount}
                      {d.maxUses ? ` / ${d.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          d.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {d.active ? "active" : "off"}
                      </span>
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
