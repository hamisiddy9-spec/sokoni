import Link from "next/link";

export const metadata = { title: "Order placed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const order = typeof sp.order === "string" ? sp.order : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-5xl">
        ✅
      </div>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">Asante! Order yako imewekwa.</h1>
      <p className="mt-3 text-gray-600">
        {order ? (
          <>
            Order number:{" "}
            <span className="font-mono font-bold text-emerald-700">{order}</span>
          </>
        ) : (
          "Tumepokea order yako."
        )}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Utapokea email ya uthibitisho. Fuatilia order yako kwa order number hapo juu.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/products"
          className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Continue shopping
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
