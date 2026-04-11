"use client";

import { ProductType, ProductsType } from "@/types";
import {
  apiClearPromotion,
  apiCreateProduct,
  apiDeleteProduct,
  apiGetProducts,
  apiSetPromotion,
  apiUpdateProduct,
} from "@/services/api";
import { useFloatingNotice } from "@/context/FloatingNoticeContext";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type ProductsContextType = {
  products: ProductsType;
  loading: boolean;
  addProduct: (product: Omit<ProductType, "id">) => Promise<void>;
  updateProduct: (id: ProductType["id"], updates: Partial<ProductType>) => Promise<void>;
  deleteProduct: (id: ProductType["id"]) => void;
  setPromotion: (id: ProductType["id"], discountPercent: number) => void;
  clearPromotion: (id: ProductType["id"]) => void;
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<ProductsType>([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useFloatingNotice();

  useEffect(() => {
    apiGetProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addProduct = async (product: Omit<ProductType, "id">) => {
    const created = await apiCreateProduct(product);
    setProducts((prev) => [...prev, created]);
  };

  const updateProduct = async (
    id: ProductType["id"],
    updates: Partial<ProductType>
  ) => {
    const updated = await apiUpdateProduct(String(id), updates);
    setProducts((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? updated : p))
    );
  };

  const deleteProduct = (id: ProductType["id"]) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    notify("Suppression du produit...", "info", 1800);
    apiDeleteProduct(String(id))
      .then(() => {
        notify("Produit supprime.", "success", 2600);
      })
      .catch((err) => {
        console.error(err);
        apiGetProducts().then(setProducts).catch(console.error);
        notify("Erreur lors de la suppression du produit.", "error", 3600);
      });
  };

  const setPromotion = (id: ProductType["id"], discountPercent: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const original = p.originalPrice ?? p.price;
        const discounted = Math.round(original * (1 - discountPercent / 100));
        return { ...p, originalPrice: original, discountPercent, price: discounted };
      })
    );
    apiSetPromotion(String(id), discountPercent)
      .then((updated) =>
        setProducts((prev) =>
          prev.map((p) => (String(p.id) === String(id) ? updated : p))
        )
      )
      .catch(console.error);
  };

  const clearPromotion = (id: ProductType["id"]) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const restoredPrice = p.originalPrice ?? p.price;
        return { ...p, price: restoredPrice, originalPrice: undefined, discountPercent: undefined };
      })
    );
    apiClearPromotion(String(id))
      .then((updated) =>
        setProducts((prev) =>
          prev.map((p) => (String(p.id) === String(id) ? updated : p))
        )
      )
      .catch(console.error);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        setPromotion,
        clearPromotion,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts must be used within ProductsProvider");
  return context;
};
