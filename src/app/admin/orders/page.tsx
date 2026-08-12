import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { ShoppingCart } from "lucide-react";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils";
import { dbSafe } from "@/lib/db-safe";
import AdminLayout from "@/components/admin/AdminLayout";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge, { statusTone } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export const metadata = { title: "Orders — Admin" };

export default async function AdminOrdersPage() {
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
      const orderRows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);
      return { orders: orderRows };
    },
    { orders: [] }
  );

  return (
    <AdminLayout isAdmin={isAdmin} email={user.email}>
      <PageHeader title="Orders" description="Orders zote za Sokoni" />

      <Card>
        {data.orders.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ShoppingCart}
              title="Hakuna orders"
              description="Orders zitaonekana hapa wateja wanapomaliza checkout."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-emerald-700">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-gray-600">{new Date(o.createdAt).toLocaleDateString()}</td>
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
    </AdminLayout>
  );
}
