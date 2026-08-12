"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCartItem, removeCartItem } from "@/app/actions/cart";

export default function CartItemControls({
  itemId,
  quantity,
}: {
  itemId: string;
  quantity: number;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function change(q: number) {
    startTransition(async () => {
      await updateCartItem(itemId, q);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => change(quantity - 1)}
          disabled={pending}
          className="px-3 py-1.5 text-sm font-bold text-gray-500 hover:text-emerald-600 disabled:opacity-40"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
        <button
          type="button"
          onClick={() => change(quantity + 1)}
          disabled={pending}
          className="px-3 py-1.5 text-sm font-bold text-gray-500 hover:text-emerald-600 disabled:opacity-40"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={() => change(0)}
        disabled={pending}
        className="text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-40"
      >
        Remove
      </button>
    </div>
  );
}
