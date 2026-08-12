import Link from "next/link";
import { eq, desc, sql, count } from "drizzle-orm";
import {
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  TicketPercent,
  Plus,
  ExternalLink,
} from "lucide-react";
import { db } from "@/db";
import { vendors, products, orders, discounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils";
import { dbSafe } from "@/lib/db-safe";
import AdminLayout from "@/components/admin/AdminLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Badge, { statusTone } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.email === "admin@sokoni.app";
  const email = user?.email ?? null;

  // Not logged in
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">🔐</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Ingia kwanza</h1>
        <p className="mt-2 text-gray-500">Unahitaji account ya admin kuona panel hii.</p>
        <Link
          href="/auth"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
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
        <p className="mt-2 text-gray-500">Admin pekee ndiye anayeweza kuona panel hii.</p>
      </div>
    );
  }

  // DB-safe stats — UI inaonekana hata DB ikiwa haipo
  const stats = await dbSafe(
    async () => {
      const [vendorCount, productCount, orderCount, revenueRows, pendingVendors, recentOrders, discountRows] =
        await Promise.all([
          db.select({ n: count() }).from(vendors),
          db.select({ n: count() }).from(products),
          db.select({ n: count() }).from(orders),
          db
            .select({ total: sql<string>`COALESCE(SUM(total), 0)` })
            .from(orders)
            .where(eq(orders.paymentStatus, "paid")),
          db.select().from(vendors).where(eq(vendors.status, "pending")).orderBy(desc(vendors.createdAt)).limit(10),
          db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8),
          db.select().from(discounts).orderBy(desc(discounts.createdAt)).limit(6),
        ]);
      return {
        vendorCount: vendorCount[0]?.n ?? 0,
        productCount: productCount[0]?.n ?? 0,
        orderCount: orderCount[0]?.n ?? 0,
        revenue: parseFloat(revenueRows[0]?.total || "0"),
        pendingVendors,
        recentOrders,
        discountRows,
        dbReady: true,
      };
    },
    {
      vendorCount: 0,
      productCount: 0,
      orderCount: 0,
      revenue: 0,
      pendingVendors: [],
      recentOrders: [],
      discountRows: [],
      dbReady: false,
    }
  );

  return (
    <AdminLayout isAdmin={isAdmin} email={email}>
      <PageHeader
        title="Dashboard"
        description={
          stats.dbReady
            ? "Muhtasari wa Sokoni — vendors, bidhaa, orders na mapato."
            : "DB bado haijasanidiwa — UI inaonekana kwa sasa, data itajaa DB ikishawekwa."
        }
        action={
          <Link
            href="/admin/discounts?new=1"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> New discount
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Vendors" value={stats.vendorCount} icon={Store} tone="emerald" hint="Total registered" />
        <StatCard label="Products" value={stats.productCount} icon={Package} tone="blue" hint="Across all vendors" />
        <StatCard label="Orders" value={stats.orderCount} icon={ShoppingCart} tone="violet" hint="All time" />
        <StatCard label="Revenue" value={formatMoney(stats.revenue)} icon={DollarSign} tone="amber" hint="Paid orders only" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        {/* Pending vendors */}
        <Card
          title="Vendor approvals"
          description="Wanakosubiri uthibitisho"
          className="xl:col-span-1"
          action={
            stats.pendingVendors.length > 0 ? (
              <Badge tone="amber">{stats.pendingVendors.length} pending</Badge>
            ) : undefined
          }
        >
          {stats.pendingVendors.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Clock}
                title="Hakuna approvals"
                description="Vendors wote wameshathibitishwa."
                className="border-0 bg-transparent py-8"
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.pendingVendors.map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">
                      {v.storeName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{v.storeName}</p>
                      <p className="truncate text-xs text-gray-500">
                        {v.city ? `${v.city}, ` : ""}
                        {v.country || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Link
                      href={`/admin/vendors?action=approve&id=${v.id}`}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Approve
                    </Link>
                    <Link
                      href={`/admin/vendors?action=reject&id=${v.id}`}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent orders */}
        <Card
          title="Recent orders"
          description="Orders za hivi karibuni"
          className="xl:col-span-2"
          action={
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              View all <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {stats.recentOrders.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={ShoppingCart}
                title="Hakuna orders bado"
                description="Orders zitaonekana hapa wateja wanaponunua."
                className="border-0 bg-transparent py-8"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold">Payment</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-emerald-700">{o.orderNumber}</td>
                      <td className="px-5 py-3 text-gray-700">{o.email || "—"}</td>
                      <td className="px-5 py-3 font-semibold text-gray-900">{formatMoney(o.total)}</td>
                      <td className="px-5 py-3">
                        <Badge tone={statusTone(o.paymentStatus)}>{o.paymentStatus}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={statusTone(o.status)}>{o.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Discount codes */}
      <div className="mt-6">
        <Card
          title="Discount codes"
          description="Codes zinazofanya kazi"
          action={
            <Link href="/admin/discounts?new=1" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Manage <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {stats.discountRows.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={TicketPercent}
                title="Hakuna discount codes"
                description="Unda code ya kwanza kuvutia wateja."
                className="border-0 bg-transparent py-8"
              />
            </div>
          ) : (
            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {stats.discountRows.map((d) => (
                <div key={d.id} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-emerald-700">{d.code}</span>
                    <Badge tone={d.active ? "emerald" : "gray"}>{d.active ? "active" : "off"}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {d.type === "percent" ? `${d.value}% off` : `${formatMoney(d.value)} off`}
                    {d.minSubtotal ? ` · min ${formatMoney(d.minSubtotal)}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {d.usedCount}
                    {d.maxUses ? ` / ${d.maxUses}` : ""} uses
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
