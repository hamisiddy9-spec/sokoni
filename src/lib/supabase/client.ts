"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, hasSupabase } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (!hasSupabase) return null;
  if (!client) {
    client = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
