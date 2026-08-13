import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL inahitajika (Supabase/Neon connection string)"),
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  // WhatsApp ingestion bot
  WHATSAPP_BOT_SECRET: z.string().optional(),
  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  APP_NAME: z.string().default("Sokoni"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .filter((i) => i.code === "invalid_type" || i.message.includes("inahitajika"))
      .map((i) => i.path.join("."));
    // During build, missing optional keys are fine; only DATABASE_URL is hard-required at runtime.
    return {
      DATABASE_URL: process.env.DATABASE_URL || "",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      WHATSAPP_BOT_SECRET: process.env.WHATSAPP_BOT_SECRET || "",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      APP_NAME: process.env.APP_NAME || "Sokoni",
    };
  }
  return parsed.data;
}

export const env = loadEnv();

export const hasSupabase = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
export const hasStripe = Boolean(env.STRIPE_SECRET_KEY);
