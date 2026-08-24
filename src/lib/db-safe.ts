/**
 * DB-safe wrapper: ikiwa database haipo (bado haijasanidiwa), inarudisha
 * empty/default data badala ya ku-crash page. Hii inaruhusu UI kuonekana
 * kabla ya DB kuwa live.
 *
 * MUHIMU: tunaswallow TU connection-level errors — sio logic errors.
 * Patterns zilizopita zilikuwa pana mno ("Invalid", "connect", "database")
 * na zinaweza kuficha bugs halisi (mf. invalid quantity, invalid API key)
 * kwa kurudisha fallback kimya kimya.
 */
const CONNECTION_ERROR_PATTERNS = [
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "getaddrinfo",
  "connection refused",
  "connection timed out",
  "does not exist",
  "password authentication",
  "database system", // Neon cold-start: "database system is starting up"
];

export async function dbSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const msg = String(err?.message || err);
    // Tu-swallow connection errors — si logic errors
    if (CONNECTION_ERROR_PATTERNS.some((p) => msg.includes(p))) {
      console.warn("[dbSafe] DB haipatikani, using fallback:", msg.slice(0, 120));
      return fallback;
    }
    throw err;
  }
}
