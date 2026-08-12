"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  TicketPercent,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  ShieldCheck,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navSections: {
  label: string;
  items: { href: string; label: string; icon: LucideIcon; exact?: boolean }[];
}[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/pending", label: "WhatsApp Inbox", icon: Inbox },
      { href: "/admin/vendors", label: "Vendors", icon: Store },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/discounts", label: "Discounts", icon: TicketPercent },
    ],
  },
  {
    label: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export default function AdminSidebar({
  isAdmin,
  email,
}: {
  isAdmin: boolean;
  email?: string | null;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-gray-800 bg-gray-950 text-gray-300 transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Brand */}
      <div className={cn("flex h-16 items-center gap-2 border-b border-gray-800/80 px-4", collapsed && "justify-center px-0")}>
        <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            S
          </span>
          {!collapsed && (
            <span className="whitespace-nowrap text-base font-bold text-white">
              Sokoni<span className="text-emerald-500"> Admin</span>
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={item.label}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-emerald-600/15 text-emerald-400"
                          : "text-gray-400 hover:bg-gray-900 hover:text-white"
                      )}
                    >
                      <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-emerald-400")} />
                      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800/80 p-3">
        {isAdmin && (
          <div className={cn("mb-2 flex items-center gap-2 rounded-xl bg-emerald-600/10 px-2.5 py-2", collapsed && "justify-center")}>
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            {!collapsed && (
              <span className="truncate text-xs font-medium text-emerald-400">Administrator</span>
            )}
          </div>
        )}
        {!collapsed && email && <p className="mb-2 truncate px-1 text-xs text-gray-600">{email}</p>}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            title="Back to store"
            className={cn(
              "flex flex-1 items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-gray-400 hover:bg-gray-900 hover:text-white",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Back to store</span>}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-900 hover:text-white"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
