"use client";

import { useProducts } from "@/context/ProductsContext";
import Categories from "./Categories";
import ProductCard from "./ProductCard";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ProductType } from "@/types";
import ProductQuickViewModal from "./ProductQuickViewModal";

const ProductList = () => {
  const { products } = useProducts();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get("category") || "all";
  const searchQuery = (searchParams.get("q") || "").trim().toLowerCase();
  const availableSlugs = new Set([
    "all",
    ...products.map((product) => product.categorySlug.toLowerCase()),
  ]);
  const selectedCategory = availableSlugs.has(rawCategory.toLowerCase())
    ? rawCategory.toLowerCase()
    : "all";
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  const handleResetFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("category");
    params.delete("q");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const filteredProducts = products.filter(
    (product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.categorySlug.toLowerCase() === selectedCategory.toLowerCase();

      const haystack = [
        product.name,
        product.shortDescription,
        product.description,
        product.category,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !searchQuery || haystack.includes(searchQuery);

      return matchesCategory && matchesSearch;
    }
  );

  const uniqueProducts = filteredProducts.filter((product, index, list) => {
    const key = `${product.name.toLowerCase()}::${product.categorySlug.toLowerCase()}`;
    return list.findIndex((item) => `${item.name.toLowerCase()}::${item.categorySlug.toLowerCase()}` === key) === index;
  });

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="w-full sm:flex-1">
          <Categories />
        </div>
        {(selectedCategory !== "all" || Boolean(searchQuery)) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="w-full shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
          >
            Reinitialiser les filtres
          </button>
        )}
      </div>
      {searchQuery && (
        <p className="mb-4 text-sm text-gray-500">
          Resultats pour <span className="font-semibold text-gray-800">&quot;{searchQuery}&quot;</span>
        </p>
      )}
      <div className="grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 sm:gap-10 md:justify-items-stretch xl:grid-cols-3 2xl:grid-cols-4">
        {uniqueProducts.map((product) => (
          <ProductCard key={product.id} product={product} onPreview={setSelectedProduct} />
        ))}
      </div>

      {uniqueProducts.length === 0 && (
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Aucun produit ne correspond a votre recherche actuelle. Essayez un autre mot-cle ou revenez sur la categorie &quot;Tout&quot;.
        </p>
      )}

      {selectedProduct && (
        <ProductQuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductList;