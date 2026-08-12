"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProductStatus } from "@/app/actions/vendor";

export default function ProductStatusToggle({
  productId,
  status,
}: {
  productId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    const next = status === "active" ? "archived" : "active";
    startTransition(async () => {
      await updateProductStatus(productId, next as any);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-emerald-600 hover:text-emerald-600 disabled:opacity-40"
    >
      {pending ? "..." : status === "active" ? "Archive" : "Activate"}
    </button>
  );
}
