"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/actions/vendor";
import type { Category } from "@/lib/types";

export default function VendorProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showForm = searchParams.get("new") === "1";
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [imageInputs, setImageInputs] = useState<string[]>([""]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    stock: "10",
    categoryId: "",
    sku: "",
    isVirtual: false,
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createProduct({
          ...form,
          stock: parseInt(form.stock) || 0,
          isVirtual: form.isVirtual,
          images: imageInputs.filter((u) => u.trim().length > 0),
        });
        router.push("/vendor/dashboard");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Imeshindikana kuweka bidhaa.");
      }
    });
  }

  if (!showForm) return null;

  const inputCls =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none";

  return (
    <div className="mt-10 rounded-2xl border border-emerald-200 bg-white p-6">
      <h2 className="text-lg font-bold text-gray-900">+ Bidhaa mpya</h2>
      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700">Jina la bidhaa *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputCls}
            placeholder="e.g. Kofia ya Pamba"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-semibold text-gray-700">Price (USD) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className={inputCls}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Compare-at price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.compareAtPrice}
              onChange={(e) => update("compareAtPrice", e.target.value)}
              className={inputCls}
              placeholder="0.00 (discount marker)"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Stock *</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              className={inputCls}
            >
              <option value="">— Chagua —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">SKU</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => update("sku", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Maelezo mafupi</label>
          <input
            type="text"
            value={form.shortDescription}
            onChange={(e) => update("shortDescription", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Maelezo kamili</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className={inputCls}
            rows={4}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Picha (image URLs)</label>
          <div className="space-y-2">
            {imageInputs.map((url, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const next = [...imageInputs];
                    next[i] = e.target.value;
                    setImageInputs(next);
                  }}
                  className={inputCls}
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={() => setImageInputs((arr) => arr.filter((_, idx) => idx !== i))}
                  className="shrink-0 rounded-lg border border-red-200 px-3 text-sm text-red-500 hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setImageInputs((arr) => [...arr, ""])}
            className="mt-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            + Ongeza picha
          </button>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:bg-gray-300"
        >
          {pending ? "Inaweka..." : "Weka bidhaa"}
        </button>
      </form>
    </div>
  );
}
