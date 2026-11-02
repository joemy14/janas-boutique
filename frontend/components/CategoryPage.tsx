import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Breadcrumb from "@/components/Breadcrumb";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/fetcher";
import type { Category, Product } from "@/types";

interface Props {
  category: Category;
  subcategory?: string;
  breadcrumb: string[];
}

/** Shared storefront listing used by every category / subcategory page. */
export default function CategoryPage({ category, subcategory, breadcrumb }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ category });
    if (subcategory) params.set("subcategory", subcategory);

    api<{ products: Product[] }>(`/api/products?${params}`).then((data) => {
      if (data.success) setProducts(data.products);
      else console.error("Failed to fetch products:", data.message);
      setLoading(false);
    });
  }, [category, subcategory]);

  const focusedId = Number(router.query.productId);
  const title = breadcrumb[breadcrumb.length - 1];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />

      <header className="mx-auto max-w-[1400px] px-6 pt-48 pb-4">
        <Breadcrumb paths={breadcrumb} />
        <h1 className="font-display text-5xl font-medium md:text-6xl">{title}</h1>
        <div className="mt-4 h-px w-24 bg-gold" />
      </header>

      <main
        className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-6 pt-6 pb-20 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        aria-busy={loading}
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <article key={index} className="card w-full overflow-hidden" aria-hidden="true">
              <div className="aspect-[3/4] w-full animate-pulse bg-surface-2" />
              <div className="space-y-2 px-4 py-4">
                <div className="h-3 w-1/3 animate-pulse rounded bg-surface-2" />
                <div className="h-6 w-3/4 animate-pulse rounded bg-surface-2" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-surface-2" />
              </div>
            </article>
          ))
        ) : products.length === 0 ? (
          <p className="text-muted italic">No pieces here yet — check back soon.</p>
        ) : (
          products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} initiallyOpen={product.id === focusedId} />
          ))
        )}
      </main>
    </div>
  );
}
