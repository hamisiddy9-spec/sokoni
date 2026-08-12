/** Format number as currency. */
export function formatMoney(amount: string | number, currency = "USD"): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return `0.00 ${currency}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n);
}

/** Slugify a string (ASCII). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Random order number: SOK-YYYYMMDD-XXXX */
export function generateOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SOK-${ymd}-${rand}`;
}

/** Random session token for guest carts. */
export function generateSessionToken(): string {
  return `sess_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** Compute discount amount given code type/value and subtotal. */
export function computeDiscount(
  type: "percent" | "fixed",
  value: string | number,
  subtotal: number
): number {
  const v = typeof value === "string" ? parseFloat(value) : value;
  if (type === "percent") {
    return Math.round(subtotal * (v / 100) * 100) / 100;
  }
  return Math.min(v, subtotal);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
