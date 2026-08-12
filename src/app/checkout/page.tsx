"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { env, hasStripe } from "@/lib/env";

const stripePromise = hasStripe
  ? loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  : null;

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [mode, setMode] = useState<"dev" | "stripe">("dev");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    line1: "",
    city: "",
    postal_code: "",
    country: "",
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function createCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          phone: form.phone,
          address: {
            line1: form.line1,
            city: form.city,
            postal_code: form.postal_code,
            country: form.country,
          },
          discountCode: discountCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout imeshindikana.");

      setOrderId(data.orderId);
      setOrderNumber(data.orderNumber);
      setMode(data.mode);

      if (data.mode === "dev") {
        // Dev mode: order imeundwa — go to success
        router.push(`/checkout/success?order=${data.orderNumber}`);
      } else {
        setClientSecret(data.clientSecret);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (clientSecret && stripePromise) {
    return (
      <StripeForm
        clientSecret={clientSecret}
        orderId={orderId!}
        orderNumber={orderNumber!}
        onError={setError}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      <p className="mt-1 text-sm text-gray-500">
        {hasStripe ? "Malipo salama kupitia Stripe." : "Dev mode — hakuna malipo halisi (Stripe keys hazijawekwa)."}
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={createCheckout} className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
        <div>
          <label className="text-sm font-semibold text-gray-700">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-700">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Address</label>
          <input
            type="text"
            value={form.line1}
            onChange={(e) => update("line1", e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
            placeholder="Street address"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <input
              type="text"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
              placeholder="City"
            />
          </div>
          <div>
            <input
              type="text"
              value={form.postal_code}
              onChange={(e) => update("postal_code", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
              placeholder="Postal code"
            />
          </div>
          <div>
            <input
              type="text"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none"
              placeholder="Country"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Discount code</label>
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase focus:border-emerald-600 focus:outline-none"
            placeholder="e.g. WELCOME10"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-gray-300"
        >
          {loading ? "Processing..." : "Continue to payment →"}
        </button>
      </form>
    </div>
  );
}

function StripeForm({
  clientSecret,
  orderId,
  orderNumber,
  onError,
}: {
  clientSecret: string;
  orderId: string;
  orderNumber: string;
  onError: (msg: string) => void;
}) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm
        clientSecret={clientSecret}
        orderId={orderId}
        orderNumber={orderNumber}
        onError={onError}
      />
    </Elements>
  );
}

function PaymentForm({
  clientSecret,
  orderId,
  orderNumber,
  onError,
}: {
  clientSecret: string;
  orderId: string;
  orderNumber: string;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order=${orderNumber}`,
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "Payment imeshindikana.");
      setProcessing(false);
      return;
    }

    // Payment succeeded without redirect — confirm server-side
    try {
      const piResult = await stripe.retrievePaymentIntent(clientSecret);
      const pi = piResult.paymentIntent;
      await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentIntentId: pi?.id }),
      });
      router.push(`/checkout/success?order=${orderNumber}`);
    } catch {
      router.push(`/checkout/success?order=${orderNumber}`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
      <p className="mt-1 text-sm text-gray-500">
        Order <span className="font-semibold">{orderNumber}</span> — weka maelezo ya kadi.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
        <PaymentElement />
        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-gray-300"
        >
          {processing ? "Processing payment..." : "Pay now"}
        </button>
        <p className="text-center text-xs text-gray-400">
          Test card: <span className="font-mono">4242 4242 4242 4242</span> · any future date · any CVC
        </p>
      </form>
    </div>
  );
}
