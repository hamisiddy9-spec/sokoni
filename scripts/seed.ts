/**
 * Sokoni seed — data ya test run.
 * Usage: npm run db:seed  (DATABASE_URL lazima iwe set)
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import {
  users,
  vendors,
  categories,
  products,
  productImages,
  discounts,
} from "../src/db/schema";
import { slugify } from "../src/lib/utils";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌ DATABASE_URL haipo. Weka connection string kwanza.");
  process.exit(1);
}

const client = postgres(url, { prepare: false });
const db = drizzle(client);

async function main() {
  console.log("🌱 Seeding Sokoni...");

  // Clean (optional — comment out kama hutaki wipe)
  await db.execute(sql`TRUNCATE TABLE product_images, products, discounts, vendors, categories, users CASCADE`);

  // Admin user (email-based admin kwa v1)
  const [adminUser] = await db
    .insert(users)
    .values({
      email: "admin@sokoni.app",
      name: "Sokoni Admin",
      role: "admin",
    })
    .returning();
  console.log("✓ Admin user:", adminUser.email);

  // Categories (tree — parent + children)
  const [electronics] = await db
    .insert(categories)
    .values({ name: "Electronics", slug: "electronics", description: "Gadgets, phones, laptops na zaidi", sortOrder: 1 })
    .returning();
  const [fashion] = await db
    .insert(categories)
    .values({ name: "Fashion", slug: "fashion", description: "Mavazi, viatu na accessories", sortOrder: 2 })
    .returning();
  const [home] = await db
    .insert(categories)
    .values({ name: "Home & Living", slug: "home-living", description: "Samani, mapambo na zaidi", sortOrder: 3 })
    .returning();
  const [beauty] = await db
    .insert(categories)
    .values({ name: "Beauty & Health", slug: "beauty-health", description: "Cosmetics, skincare na zaidi", sortOrder: 4 })
    .returning();
  const [digital] = await db
    .insert(categories)
    .values({ name: "Digital Products", slug: "digital-products", description: "E-books, software, templates", sortOrder: 5, parentId: electronics.id })
    .returning();

  await db.insert(categories).values([
    { name: "Phones", slug: "phones", parentId: electronics.id, sortOrder: 1 },
    { name: "Laptops", slug: "laptops", parentId: electronics.id, sortOrder: 2 },
    { name: "Audio", slug: "audio", parentId: electronics.id, sortOrder: 3 },
    { name: "Men", slug: "men-fashion", parentId: fashion.id, sortOrder: 1 },
    { name: "Women", slug: "women-fashion", parentId: fashion.id, sortOrder: 2 },
    { name: "Shoes", slug: "shoes", parentId: fashion.id, sortOrder: 3 },
    { name: "Furniture", slug: "furniture", parentId: home.id, sortOrder: 1 },
    { name: "Decor", slug: "decor", parentId: home.id, sortOrder: 2 },
    { name: "Skincare", slug: "skincare", parentId: beauty.id, sortOrder: 1 },
    { name: "Fragrance", slug: "fragrance", parentId: beauty.id, sortOrder: 2 },
  ]);
  console.log("✓ Categories zimewekwa");

  // Vendors
  const [vendorUser1] = await db
    .insert(users)
    .values({ email: "vendor1@example.com", name: "Amina Juma", role: "vendor" })
    .returning();
  const [vendorUser2] = await db
    .insert(users)
    .values({ email: "vendor2@example.com", name: "David Mushi", role: "vendor" })
    .returning();

  const [vendor1] = await db
    .insert(vendors)
    .values({
      userId: vendorUser1.id,
      storeName: "TechKwanza",
      slug: "techkwanza",
      description: "Vifaa vya elektroniki vya kisasa — phones, laptops, audio. Ubora, bei nzuri.",
      country: "Tanzania",
      city: "Dar es Salaam",
      status: "approved",
      rating: "4.6",
    })
    .returning();
  const [vendor2] = await db
    .insert(vendors)
    .values({
      userId: vendorUser2.id,
      storeName: "StyleHaus",
      slug: "stylehaus",
      description: "Fashion ya kisasa kwa wanaume na wanawake — mavazi, viatu na accessories.",
      country: "Tanzania",
      city: "Arusha",
      status: "approved",
      rating: "4.3",
    })
    .returning();
  const [vendor3] = await db
    .insert(vendors)
    .values({
      userId: adminUser.id,
      storeName: "Sokoni Digital",
      slug: "sokoni-digital",
      description: "Digital products — templates, e-books na software kutoka Sokoni.",
      country: "Tanzania",
      city: "Dar es Salaam",
      status: "approved",
      rating: "4.9",
    })
    .returning();
  console.log("✓ Vendors 3 wamewekwa");

  // Products
  const img = (seed: number) => `https://picsum.photos/seed/sokoni${seed}/600/600`;

  const [p1] = await db
    .insert(products)
    .values({
      vendorId: vendor1.id,
      categoryId: electronics.id,
      name: "Smartphone X20 Pro",
      slug: `smartphone-x20-pro-${slugify(Math.random().toString(36).slice(2, 6))}`,
      shortDescription: "Smartphone ya kisasa — 256GB, camera 108MP, battery 5000mAh.",
      description: "Smartphone X20 Pro inakuja na screen 6.7\" AMOLED, processor ya haraka, camera 108MP, na battery inayodumu siku nzima. Inafaa kwa kazi na michezo.",
      price: "599.00",
      compareAtPrice: "699.00",
      stock: 25,
      sku: "TECH-X20PRO",
      status: "active",
      featured: true,
      salesCount: 42,
      rating: "4.7",
      ratingCount: 31,
    })
    .returning();

  const [p2] = await db
    .insert(products)
    .values({
      vendorId: vendor1.id,
      categoryId: digital.id,
      name: "Wireless Earbuds SoundOne",
      slug: `wireless-earbuds-soundone-${slugify(Math.random().toString(36).slice(2, 6))}`,
      shortDescription: "Earbuds zisizo na waya — ANC, battery 30hr, waterproof.",
      description: "SoundOne earbuds na Active Noise Cancellation, battery hadi 30 hours, na IPX5 waterproof. Ubora wa sauti wa studio kwa bei nafuu.",
      price: "79.99",
      compareAtPrice: "99.99",
      stock: 60,
      sku: "TECH-SOUND1",
      status: "active",
      featured: true,
      salesCount: 128,
      rating: "4.5",
      ratingCount: 89,
    })
    .returning();

  const [p3] = await db
    .insert(products)
    .values({
      vendorId: vendor2.id,
      categoryId: fashion.id,
      name: "Classic Denim Jacket",
      slug: `classic-denim-jacket-${slugify(Math.random().toString(36).slice(2, 6))}`,
      shortDescription: "Denim jacket ya classic — inafaa kila msimu.",
      description: "Denim jacket ya kudumu, design ya classic ambayo haitakufa mtindo. Inapatikana sizes S-XXL. Ubora wa juu, bei nzuri.",
      price: "54.99",
      stock: 40,
      sku: "STYLE-DENIM",
      status: "active",
      featured: true,
      salesCount: 67,
      rating: "4.4",
      ratingCount: 45,
    })
    .returning();

  const [p4] = await db
    .insert(products)
    .values({
      vendorId: vendor2.id,
      categoryId: fashion.id,
      name: "Leather Sneakers Urban",
      slug: `leather-sneakers-urban-${slugify(Math.random().toString(36).slice(2, 6))}`,
      shortDescription: "Sneakers za ngozi halisi — comfortable na stylish.",
      description: "Sneakers za leather halisi, sole comfortable, inafaa kwa kila siku. Sizes 39-45.",
      price: "89.00",
      compareAtPrice: "110.00",
      stock: 35,
      sku: "STYLE-SNEAK",
      status: "active",
      featured: true,
      salesCount: 54,
      rating: "4.6",
      ratingCount: 38,
    })
    .returning();

  const [p5] = await db
    .insert(products)
    .values({
      vendorId: vendor3.id,
      categoryId: digital.id,
      name: "Sokoni Template Pack (50 Templates)",
      slug: `sokoni-template-pack-${slugify(Math.random().toString(36).slice(2, 6))}`,
      shortDescription: "Digital product — 50 premium website templates.",
      description: "Digital product! Pata 50 premium website templates kwa bei moja. Instant delivery baada ya malipo — download link itatumwa kwenye email yako.",
      price: "29.00",
      compareAtPrice: "99.00",
      stock: 999,
      sku: "DIGI-TPL50",
      isVirtual: true,
      status: "active",
      featured: true,
      salesCount: 210,
      rating: "4.9",
      ratingCount: 156,
    })
    .returning();

  const [p6] = await db
    .insert(products)
    .values({
      vendorId: vendor3.id,
      categoryId: home.id,
      name: "Handmade Wooden Decor Set",
      slug: `handmade-wooden-decor-${slugify(Math.random().toString(36).slice(2, 6))}`,
      shortDescription: "Mapambo ya mbao yaliyotengenezwa kwa mkono — Tanzania.",
      description: "Set ya mapambo ya mbao yaliyochongwa kwa mkono na mafundi wa Tanzania. Kila kipande ni unique — inaongeza joto na utamaduni nyumbani kwako.",
      price: "45.00",
      stock: 15,
      sku: "HOME-WOOD",
      status: "active",
      featured: false,
      salesCount: 12,
      rating: "4.8",
      ratingCount: 9,
    })
    .returning();

  // Product images
  const productSeeds: [string, number[]][] = [
    [p1.id, [1, 2, 3]],
    [p2.id, [4, 5]],
    [p3.id, [6, 7]],
    [p4.id, [8, 9]],
    [p5.id, [10]],
    [p6.id, [11, 12]],
  ];
  for (const [pid, seeds] of productSeeds) {
    for (const [i, s] of seeds.entries()) {
      await db.insert(productImages).values({ productId: pid, url: img(s), sortOrder: i });
    }
  }
  console.log("✓ Bidhaa 6 + picha zimewekwa");

  // Discount codes
  await db.insert(discounts).values([
    { code: "WELCOME10", type: "percent", value: "10", minSubtotal: "20", maxUses: 100, active: true },
    { code: "SAVE5", type: "fixed", value: "5", minSubtotal: "25", active: true },
    { code: "DIGITAL20", type: "percent", value: "20", minSubtotal: "15", maxUses: 50, active: true },
  ]);
  console.log("✓ Discount codes: WELCOME10, SAVE5, DIGITAL20");

  console.log("\n✅ Seeding complete!");
  console.log("  Admin:   admin@sokoni.app");
  console.log("  Vendor:  vendor1@example.com (TechKwanza)");
  console.log("  Vendor:  vendor2@example.com (StyleHaus)");
  console.log("  Test discount codes: WELCOME10, SAVE5, DIGITAL20");

  await client.end();
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
