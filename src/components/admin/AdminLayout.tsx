import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
  isAdmin,
  email,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
  email?: string | null;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">
      <AdminSidebar isAdmin={isAdmin} email={email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
