"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDiscount } from "@/app/actions/admin";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { TicketPercent } from "lucide-react";

export default function DiscountForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: "10",
    minSubtotal: "",
    maxUses: "",
    expiresAt: "",
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createDiscount({
          code: form.code,
          type: form.type as any,
          value: form.value,
          minSubtotal: form.minSubtotal || undefined,
          maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
          expiresAt: form.expiresAt || undefined,
        });
        router.push("/admin");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Imeshindikana.");
      }
    });
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <PageHeader title="+ Discount code" description="Unda code mpya ya punguzo" />
      <Card className="p-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Code *</label>
            <div className="relative mt-1">
              <TicketPercent className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => update("code", e.target.value.toUpperCase())}
                className={`${inputCls} pl-10 uppercase`}
                placeholder="e.g. WELCOME10"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-gray-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className={inputCls}
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Value *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.value}
                onChange={(e) => update("value", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-gray-700">Min subtotal</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minSubtotal}
                onChange={(e) => update("minSubtotal", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Max uses</label>
              <input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => update("maxUses", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Expires</label>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => update("expiresAt", e.target.value)}
              className={inputCls}
            />
          </div>
          <Button type="submit" disabled={pending} size="lg" className="w-full">
            {pending ? "Inaunda..." : "Create code"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
