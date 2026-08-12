import type { ProductWithImages } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default function ProductGrid({
  products,
  emptyMessage = "Hakuna bidhaa zinazopatikana kwa sasa.",
}: {
  products: ProductWithImages[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-4xl">🛒</p>
        <p className="mt-3 text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
