"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/vendors", label: "Vendors" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white">
            S
          </span>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Sokoni<span className="text-emerald-600">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-emerald-600",
                pathname === link.href ? "text-emerald-600" : "text-gray-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-emerald-600 hover:text-emerald-600"
          >
            Cart
          </Link>
          <Link
            href="/auth"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Sign in
          </Link>
          <Link
            href="/vendor"
            className="hidden rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 sm:block"
          >
            Sell
          </Link>
        </div>
      </div>
    </header>
  );
}
