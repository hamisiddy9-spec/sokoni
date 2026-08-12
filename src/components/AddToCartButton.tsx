"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/cart";

export default function AddToCartButton({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const router = useRouter();
  const soldOut = stock <= 0;

  function handleAdd() {
    startTransition(async () => {
      await addToCart(productId, quantity);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center rounded-xl border border-gray-300 bg-white">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-4 py-3 text-lg font-bold text-gray-500 hover:text-emerald-600"
        >
          −
        </button>
        <span className="w-10 text-center text-sm font-bold">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
          className="px-4 py-3 text-lg font-bold text-gray-500 hover:text-emerald-600"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut || pending}
        className="flex-1 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {soldOut ? "Sold out" : pending ? "Adding..." : done ? "✓ Added to cart" : "Add to cart"}
      </button>
    </div>
  );
}
