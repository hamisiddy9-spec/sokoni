import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PageHeader({
  title,
  description,
  action,
  backHref,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  backHref?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
