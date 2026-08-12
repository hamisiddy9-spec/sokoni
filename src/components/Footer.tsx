import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
              S
            </span>
            <span className="text-lg font-bold text-gray-900">Sokoni</span>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Multi-vendor marketplace — nunua na uze kwa urahisi, popote ulipo.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><Link href="/products" className="hover:text-emerald-600">All products</Link></li>
            <li><Link href="/vendors" className="hover:text-emerald-600">Vendors</Link></li>
            <li><Link href="/cart" className="hover:text-emerald-600">Cart</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900">Sell</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><Link href="/vendor" className="hover:text-emerald-600">Become a vendor</Link></li>
            <li><Link href="/vendor/dashboard" className="hover:text-emerald-600">Vendor dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900">Account</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><Link href="/auth" className="hover:text-emerald-600">Sign in</Link></li>
            <li><Link href="/auth?tab=register" className="hover:text-emerald-600">Register</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Sokoni Marketplace. Built with Next.js + Drizzle + Stripe.
      </div>
    </footer>
  );
}
