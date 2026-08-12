import Link from "next/link";
import { Globe, Mail, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import AdminLayout from "@/components/admin/AdminLayout";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings — Admin" };

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.email === "admin@sokoni.app";

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">🔐</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Ingia kwanza</h1>
        <Link href="/auth" className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700">
          Sign in
        </Link>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">⛔</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Huna ruhusa</h1>
      </div>
    );
  }

  const settings = [
    {
      icon: Globe,
      title: "Store settings",
      desc: "Jina la store, currency, language default",
      value: "Soon",
    },
    {
      icon: Mail,
      title: "Email notifications",
      desc: "Order emails, vendor notifications",
      value: "Soon",
    },
    {
      icon: ShieldCheck,
      title: "Security",
      desc: "Admin accounts, permissions",
      value: "Soon",
    },
  ];

  return (
    <AdminLayout isAdmin={isAdmin} email={user.email}>
      <PageHeader title="Settings" description="Mipangilio ya Sokoni" />

      <div className="grid gap-4 md:grid-cols-3">
        {settings.map((s) => (
          <Card key={s.title} className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <s.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">{s.title}</h3>
            <p className="mt-1 text-xs text-gray-500">{s.desc}</p>
            <span className="mt-3 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
              {s.value}
            </span>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
