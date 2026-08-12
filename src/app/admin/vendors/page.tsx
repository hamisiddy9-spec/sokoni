import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminVendorActionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.email !== "admin@sokoni.app") redirect("/auth");

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
  }

  redirect("/admin");
}
