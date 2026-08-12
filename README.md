# Sokoni — Multi-Vendor Marketplace

Sokoni ni marketplace ya kisasa ya multi-vendor — rewrite ya [Ecommerce-CodeIgniter-Bootstrap](https://github.com/kirilkirkov/Ecommerce-CodeIgniter-Bootstrap) (MIT) kwenye stack ya kisasa.

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · Drizzle ORM · PostgreSQL (Supabase/Neon) · Stripe · Hono API

## Features

- 🏪 **Multi-vendor** — vendors wanajiandikisha, admin anaidhinisha, kila vendor ana dashboard yake
- 🛍️ **Bidhaa** — categories (tree), featured, search, sorting, stock tracking, digital products
- 🛒 **Cart** — guest cart (cookie-based) + quantity management
- 💳 **Malipo** — Stripe PaymentIntent (test mode) + dev mode bila keys
- 🏷️ **Discount codes** — percent/fixed, min subtotal, max uses, expiry
- 👑 **Admin panel** — vendor approval, stats, discount management
- 📦 **Orders** — order numbers, snapshots za bidhaa, webhook ya Stripe
- 🔐 **Auth** — Supabase Auth (email + Google OAuth)

## Quick start (local)

```bash
npm install
cp .env.example .env   # weka DATABASE_URL + Supabase + Stripe keys
npm run db:push        # create tables (drizzle-kit push)
npm run db:seed        # seed test data
npm run dev            # http://localhost:3000
```

## Database

```bash
npm run db:generate    # generate migration
npm run db:migrate     # run migrations
npm run db:seed        # seed: categories, vendors, products, discount codes
npm run db:studio      # Drizzle Studio UI
```

## Test data (seed)

| Role | Email | Notes |
|------|-------|-------|
| Admin | admin@sokoni.app | Admin panel: /admin |
| Vendor 1 | vendor1@example.com | TechKwanza (approved) |
| Vendor 2 | vendor2@example.com | StyleHaus (approved) |

Discount codes: `WELCOME10`, `SAVE5`, `DIGITAL20`

Test card (Stripe): `4242 4242 4242 4242` · future date · any CVC

## Deploy

```bash
vercel deploy --prod
```

Env vars zinazohitajika: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`.

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Landing
│   ├── products/             # Catalog + detail
│   ├── cart/                 # Cart
│   ├── checkout/             # Checkout + success
│   ├── auth/                 # Sign in / register + callback
│   ├── vendor/               # Vendor landing, register, dashboard
│   ├── admin/                # Admin dashboard, discounts, vendor approval
│   ├── api/[[...route]]/     # Hono API (checkout, webhooks, orders)
│   └── actions/              # Server actions (cart, vendor, admin)
├── components/               # UI components
├── db/
│   ├── schema.ts             # Drizzle schema (users→vendors→products→orders)
│   └── index.ts              # DB client
└── lib/                      # env, stripe, supabase, queries, utils
```

## License

MIT — original CodeIgniter project na hii rewrite zote ni MIT.
