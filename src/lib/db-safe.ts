/**
 * DB-safe wrapper: ikiwa database haipo (bado haijasanidiwa), inarudisha
 * empty/default data badala ya ku-crash page. Hii inaruhusu UI kuonekana
 * kabla ya DB kuwa live.
 */
export async function dbSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const msg = String(err?.message || err);
    // Tu-swallow connection errors — si logic errors
    if (
      msg.includes("ECONNREFUSED") ||
      msg.includes("connect") ||
      msg.includes("database") ||
      msg.includes("does not exist") ||
      msg.includes("password authentication") ||
      msg.includes("placeholder") ||
      msg.includes("getaddrinfo") ||
      msg.includes("Invalid") ||
      msg.includes("invalid")
    ) {
      console.warn("[dbSafe] DB haipatikani, using fallback:", msg.slice(0, 120));
      return fallback;
    }
    throw err;
  }
}
