import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const toneStyles: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/10",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/10",
  red: "bg-red-50 text-red-700 ring-red-600/10",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/10",
  gray: "bg-gray-50 text-gray-700 ring-gray-600/10",
};

export default function Badge({
  children,
  tone = "gray",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneStyles | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        toneStyles[tone] || toneStyles.gray,
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): string {
  switch (status) {
    case "active":
    case "approved":
    case "paid":
    case "delivered":
      return "emerald";
    case "pending":
    case "shipped":
      return "amber";
    case "draft":
    case "unpaid":
      return "gray";
    case "suspended":
    case "archived":
    case "cancelled":
    case "failed":
    case "refunded":
      return "red";
    default:
      return "gray";
  }
}
