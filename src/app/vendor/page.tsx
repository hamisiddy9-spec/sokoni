import Link from "next/link";

export const metadata = { title: "Sell on Sokoni" };

export default function VendorLandingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          🏪 For vendors
        </p>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Uze kwenye Sokoni
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Fungua duka lako la mtandaoni bila gharama. Weka bidhaa, pata wateja,
          pata malipo moja kwa moja kwenye account yako.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/vendor/register"
            className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Register duka lako →
          </Link>
          <Link
            href="/vendor/dashboard"
            className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Vendor dashboard
          </Link>
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          { icon: "🛠️", title: "Usimamizi rahisi", desc: "Weka, hariri na fuatilia bidhaa zako kwenye dashboard rafiki." },
          { icon: "💰", title: "Malipo moja kwa moja", desc: "Pata fedha zako kwenye account yako — Stripe inashughulikia." },
          { icon: "📈", title: "Fikia wateja wengi", desc: "Marketplace inamaanisha traffic ya juu kwa duka lako." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-4xl">{f.icon}</p>
            <h3 className="mt-4 text-lg font-bold text-gray-900">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
