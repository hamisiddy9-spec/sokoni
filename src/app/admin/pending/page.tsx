import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { Inbox, Check, X, MessageSquare, MapPin } from "lucide-react";
import { db } from "@/db";
import { pendingProducts } from "@/db/pending-schema";
import { getCurrentUser } from "@/lib/supabase/server";
import { dbSafe } from "@/lib/db-safe";
import AdminLayout from "@/components/admin/AdminLayout";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import PendingProductActions from "@/components/PendingProductActions";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pending products — Admin" };

export default async function AdminPendingPage() {
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
      const pending = await db
        .select()
        .from(pendingProducts)
        .where(eq(pendingProducts.status, "pending"))
        .orderBy(desc(pendingProducts.createdAt))
        .limit(50);
      const recent = await db
        .select()
        .from(pendingProducts)
        .where(eq(pendingProducts.status, "approved"))
        .orderBy(desc(pendingProducts.reviewedAt))
        .limit(5);
      return { pending, recent };
    },
    { pending: [], recent: [] }
  );

  return (
    <AdminLayout isAdmin={isAdmin} email={user.email}>
      <PageHeader
        title="WhatsApp Inbox"
        description="Bidhaa zinazotoka WhatsApp groups/channels — thibitisha kabla ya live"
      />

      {/* Pending products */}
      <Card
        title={`Pending (${data.pending.length})`}
        description="Zinazosubiri uthibitisho wako"
      >
        {data.pending.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Inbox}
              title="Hakuna pending"
              description="Bidhaa kutoka WhatsApp zitaonekana hapa mara bot inapoziona kwenye groups/channels."
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.pending.map((p) => {
              const images: string[] = Array.isArray(p.images) ? (p.images as string[]) : [];
              return (
                <div key={p.id} className="flex gap-4 px-5 py-4">
                  {/* Image */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={images[0]} alt={p.suggestedName || "product"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">🛍️</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {p.suggestedName || p.make || p.model || "(Hakuna jina)"}
                      </h3>
                      {p.price && (
                        <Badge tone="emerald">{formatMoney(p.price, p.currency || "TZS")}</Badge>
                      )}
                      {p.make && <Badge tone="blue">{p.make}</Badge>}
                      {p.model && <Badge tone="violet">{p.model}</Badge>}
                    </div>

                    {/* Source info */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      {p.sourceGroupName && (
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" /> {p.sourceGroupName}
                        </span>
                      )}
                      {p.sellerName && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {p.sellerName}
                        </span>
                      )}
                      {p.postedAt && (
                        <span>{new Date(p.postedAt).toLocaleString()}</span>
                      )}
                    </div>

                    {/* Raw text preview */}
                    {p.rawText && (
                      <p className="clamp-2 mt-2 text-xs text-gray-500">{p.rawText}</p>
                    )}
                    {p.suggestedDescription && (
                      <p className="clamp-2 mt-1 text-xs text-gray-400 italic">
                        AI: {p.suggestedDescription}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-2">
                      <PendingProductActions
                        pendingId={p.id}
                        suggestedName={p.suggestedName || `${p.make || ""} ${p.model || ""}`.trim() || "Product"}
                        suggestedPrice={p.price || ""}
                        suggestedDescription={p.suggestedDescription || ""}
                        currency={p.currency || "TZS"}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Recently approved */}
      {data.recent.length > 0 && (
        <div className="mt-6">
          <Card title="Zilizothibitishwa hivi karibuni" description="Approved na kuwa live">
            <div className="divide-y divide-gray-50">
              {data.recent.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {p.suggestedName || p.model || "Product"}
                      </p>
                      <p className="text-xs text-gray-500">{p.sourceGroupName || "—"}</p>
                    </div>
                  </div>
                  {p.productId && (
                    <Link
                      href={`/products/${p.productId}`}
                      className="text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      View
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
