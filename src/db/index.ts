import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";

// Single shared connection for server-side queries (edge-safe pool via postgres-js)
const client = postgres(env.DATABASE_URL, {
  max: 10,
  prepare: false, // required for Drizzle + postgres-js
});

export const db = drizzle(client, { schema });
export { schema };
