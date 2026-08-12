import type { InferSelectModel } from "drizzle-orm";
import type {
  products,
  productImages,
  vendors,
  categories,
} from "@/db/schema";

export type Product = InferSelectModel<typeof products>;
export type ProductImage = InferSelectModel<typeof productImages>;
export type Vendor = InferSelectModel<typeof vendors>;
export type Category = InferSelectModel<typeof categories>;

export type ProductWithImages = Product & {
  images?: ProductImage[];
  vendor?: Vendor | null;
  category?: Category | null;
};
