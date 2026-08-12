import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Store, CheckCircle2, XCircle } from "lucide-react";
import { db } from "@/db";
import { vendors, products } from "@/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";
import { dbSafe } from "@/lib/db-safe";
import AdminLayout from "@/components/admin/AdminLayout";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge, { statusTone } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export const metadata = { title: "Vendors — Admin" };

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.email !== "admin@sokoni.app") redirect("/auth");

  // Handle approve/reject actions
  const sp = await searchParams;
  const action = typeof sp.action === "string" ? sp.action : null;
  const id = typeof sp.id === "string" ? sp.id : null;
  if (action && id) {
    if (action === "approve") {
      await db
        .update(vendors)
        .set({ status: "approved", updatedAt: new Date() })
        .where(eq(vendors.id, id));
    } else if (action === "reject") {
      await db
        .update(vendors)
        .set({ status: "suspended", updatedAt: new Date() })
        .where(eq(vendors.id, id));
    }
    redirect("/admin/vendors");
  }

  const data = await dbSafe(
    async () => {
      const vendorRows = await db.select().from(vendors).orderBy(desc(vendors.createdAt));
      const vendorIds = vendorRows.map((v) => v.id);
      const perVendor = new Map<string, number>();
      if (vendorIds.length > 0) {
        const all = await db.select({ vendorId: products.vendorId }).from(products);
        for (const row of all) {
          perVendor.set(row.vendorId, (perVendor.get(row.vendorId) || 0) + 1);
        }
      }
      return {
        vendors: vendorRows.map((v) => ({
          ...v,
          productCount: perVendor.get(v.id) || 0,
        })),
      };
    },
    { vendors: [] }
  );

  const counts = {
    total: data.vendors.length,
    pending: data.vendors.filter((v) => v.status === "pending").length,
    approved: data.vendors.filter((v) => v.status === "approved").length,
    suspended: data.vendors.filter((v) => v.status === "suspended").length,
  };

  return (
    <AdminLayout isAdmin={true} email={user.email}>
      <PageHeader
        title="Vendors"
        description={`${counts.total} vendors · ${counts.pending} pending · ${counts.approved} approved · ${counts.suspended} suspended`}
      />

      <Card>
        {data.vendors.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Store}
              title="Hakuna vendors"
              description="Vendors wataonekana hapa wakijisajili."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Store</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">Products</th>
                  <th className="px-5 py-3 font-semibold">Rating</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">
                          {v.storeName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{v.storeName}</p>
                          <Link
                            href={`/products?vendor=${v.slug}`}
                            className="text-xs text-emerald-600 hover:underline"
                          >
                            View store
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {[v.city, v.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{v.productCount}</td>
                    <td className="px-5 py-3 text-gray-700">⭐ {v.rating || "0"}</td>
                    <td className="px-5 py-3">
                      <Badge tone={statusTone(v.status)}>{v.status}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      {v.status === "pending" ? (
                        <div className="flex gap-1.5">
                          <Link
                            href={`/admin/vendors?action=approve&id=${v.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                          </Link>
                          <Link
                            href={`/admin/vendors?action=reject&id=${v.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Link>
                        </div>
                      ) : v.status === "approved" ? (
                        <Link
                          href={`/admin/vendors?action=reject&id=${v.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Suspend
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/vendors?action=approve&id=${v.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Re-activate
                        </Link>
                      )}
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
