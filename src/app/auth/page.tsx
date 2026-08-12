"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = getBrowserClient();
    if (!supabase) {
      setError("Supabase haijasanidiwa. Weka NEXT_PUBLIC_SUPABASE_URL + anon key.");
      setLoading(false);
      return;
    }

    try {
      if (tab === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        setMessage(
          data.session
            ? "Umefanikiwa kujisajili! Unaelekezwa..."
            : "Angalia email yako kuthibitisha account."
        );
        if (data.session) {
          router.push("/");
          router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Imeshindikana.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const supabase = getBrowserClient();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  const inputCls =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none";

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {tab === "login" ? "Karibu tena" : "Unda account"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {tab === "login" ? "Ingia kwenye Sokoni." : "Jiunge na Sokoni — nunua na uze."}
        </p>

        {/* Tabs */}
        <div className="mt-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setError(null);
                setMessage(null);
              }}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                tab === t ? "bg-white text-emerald-700 shadow" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

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
          {tab === "register" && (
            <div>
              <label className="text-sm font-semibold text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                placeholder="Jina lako"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-gray-300"
          >
            {loading
              ? "Processing..."
              : tab === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">au</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
