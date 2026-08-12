import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const iconTone: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  violet: "bg-violet-100 text-violet-700",
  gray: "bg-gray-100 text-gray-700",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "emerald",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: keyof typeof iconTone | string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", iconTone[tone] || iconTone.gray)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
