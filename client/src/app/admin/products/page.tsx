"use client";

import { useProducts } from "@/context/ProductsContext";
import Link from "next/link";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ProductType } from "@/types";

const AdminProductsPage = () => {
  const { products, deleteProduct } = useProducts();
  const [confirmId, setConfirmId] = useState<ProductType["id"] | null>(null);

  const fmt = (price: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(price);

  const handleDelete = (id: ProductType["id"]) => {
    if (confirmId === id) {
      deleteProduct(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} produit(s) en catalogue</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" /> Ajouter un produit
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 flex flex-col items-center gap-3">
          <Package className="h-10 w-10 text-gray-400" />
          <p className="text-gray-500">Aucun produit. Ajoutez votre premier produit.</p>
          <Link href="/admin/products/new" className="text-sm text-emerald-600 hover:underline">
            Ajouter un produit
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Produit</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Catégorie</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Prix</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Promo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Stock</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                return (
                <tr key={product.id} className="border-b border-gray-200 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 text-gray-600">{product.category}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{fmt(product.price)}</span>
                    {product.originalPrice && (
                      <span className="ml-2 text-xs line-through text-gray-400">
                        {fmt(product.originalPrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {product.discountPercent ? (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                        -{product.discountPercent}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {product.inStock !== false ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        En stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                        Rupture
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 transition"
                        title="Modifier"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className={`rounded-md border p-1.5 transition ${
                          confirmId === product.id
                            ? "border-red-400 bg-red-50 text-red-600"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                        title={confirmId === product.id ? "Confirmer la suppression" : "Supprimer"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {confirmId === product.id && (
                      <p className="mt-1 text-right text-xs text-red-500">
                        Cliquer à nouveau pour confirmer
                      </p>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
