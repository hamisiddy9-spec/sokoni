"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { discounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";

export async function createDiscount(input: {
  code: string;
  type: "percent" | "fixed";
  value: string;
  minSubtotal?: string;
  maxUses?: number;
  expiresAt?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.email !== "admin@sokoni.app") throw new Error("Unauthorized");

  const code = input.code.trim().toUpperCase();
  if (!code) throw new Error("Code inahitajika.");

  const existing = await db.select().from(discounts).where(eq(discounts.code, code)).limit(1);
  if (existing[0]) throw new Error("Code hii ipo tayari.");

  await db.insert(discounts).values({
    code,
    type: input.type,
    value: input.value,
    minSubtotal: input.minSubtotal || null,
    maxUses: input.maxUses ?? null,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    active: true,
  });

  revalidatePath("/admin");
  return { ok: true };
}
