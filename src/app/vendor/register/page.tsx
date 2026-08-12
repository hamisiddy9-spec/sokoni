"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import { registerVendor } from "@/app/actions/vendor";

export default function VendorRegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    storeName: "",
    description: "",
    country: "",
    city: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const inputCls =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = getBrowserClient();
      if (!supabase) throw new Error("Supabase haijasanidiwa.");

      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { name: form.storeName } },
      });
      if (authError) throw authError;
      if (!data.user) throw new Error("Account haikuundwa.");

      await registerVendor({
        storeName: form.storeName,
        description: form.description,
        country: form.country,
        city: form.city,
      });

      setMessage(
        "Duka lako limewasilishwa kwa uthibitisho! Tutaendelea baada ya admin kukuidhinisha."
      );
      setTimeout(() => router.push("/vendor/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message || "Imeshindikana.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-gray-900">Fungua duka lako</h1>
        <p className="mt-1 text-sm text-gray-500">
          Jisajili kama vendor — account yako itakaguliwa na admin kabla ya kuanza kuuza.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Store name *</label>
            <input
              type="text"
              required
              value={form.storeName}
              onChange={(e) => update("storeName", e.target.value)}
              className={inputCls}
              placeholder="e.g. Duka la Jamii"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className={inputCls}
              rows={3}
              placeholder="Eleza duka lako lina uza nini..."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-gray-700">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className={inputCls}
                placeholder="e.g. Tanzania"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className={inputCls}
                placeholder="e.g. Dar es Salaam"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-gray-300"
          >
            {loading ? "Processing..." : "Register duka →"}
          </button>
        </form>
      </div>
    </div>
  );
}
