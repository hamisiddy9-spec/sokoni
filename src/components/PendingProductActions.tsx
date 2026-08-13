"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Pencil } from "lucide-react";
import { approvePendingProduct, rejectPendingProduct } from "@/app/actions/pending";
import Button from "@/components/ui/Button";

export default function PendingProductActions({
  pendingId,
  suggestedName,
  suggestedPrice,
  suggestedDescription,
  currency,
}: {
  pendingId: string;
  suggestedName: string;
  suggestedPrice: string;
  suggestedDescription: string;
  currency: string;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({
    name: suggestedName,
    price: suggestedPrice,
    description: suggestedDescription,
  });

  function approve() {
    setError(null);
    startTransition(async () => {
      try {
        await approvePendingProduct(pendingId, {
          name: form.name || suggestedName,
          price: form.price || suggestedPrice || "0",
          description: form.description,
          currency,
        });
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Imeshindikana.");
      }
    });
  }

  function reject() {
    setError(null);
    startTransition(async () => {
      await rejectPendingProduct(pendingId);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <div className="mt-2 space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
          placeholder="Jina la bidhaa"
        />
        <input
          type="text"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
          placeholder={`Bei (${currency})`}
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
          rows={3}
          placeholder="Description"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={approve} disabled={pending}>
            <Check className="h-3.5 w-3.5" /> Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={pending}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={approve} disabled={pending}>
        <Check className="h-3.5 w-3.5" /> Approve
      </Button>
      <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={pending}>
        <Pencil className="h-3.5 w-3.5" /> Edit
      </Button>
      <Button size="sm" variant="ghost" onClick={reject} disabled={pending} className="text-red-600 hover:bg-red-50">
        <X className="h-3.5 w-3.5" /> Reject
      </Button>
    </div>
  );
}
