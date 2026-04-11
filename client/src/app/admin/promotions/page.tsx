"use client";

import { useProducts } from "@/context/ProductsContext";
import { ProductType } from "@/types";
import { useState } from "react";
import { Tag, X } from "lucide-react";

const fmt = (price: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(price);

const PRESET_DISCOUNTS = [5, 10, 15, 20, 25, 30, 40, 50];

const PromotionRow = ({ product }: { product: ProductType }) => {
  const { setPromotion, clearPromotion } = useProducts();
  const [discount, setDiscount] = useState<string>(
    product.discountPercent ? String(product.discountPercent) : ""
  );
  const [saved, setSaved] = useState(false);

  const handleApply = () => {
    const val = Number(discount);
    if (isNaN(val) || val <= 0 || val >= 100) return;
    setPromotion(product.id, val);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    clearPromotion(product.id);
    setDiscount("");
  };

  return (
    <tr className="border-b border-gray-200 last:border-0">
      <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
      <td className="px-4 py-3 text-gray-600">{product.category}</td>
      <td className="px-4 py-3">
        {product.originalPrice ? (
          <div>
            <span className="font-medium text-gray-900">{fmt(product.price)}</span>
            <span className="ml-2 text-xs line-through text-gray-400">
              {fmt(product.originalPrice)}
            </span>
          </div>
        ) : (
          <span className="font-medium text-gray-900">{fmt(product.price)}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Preset buttons */}
          <div className="flex flex-wrap gap-1">
            {PRESET_DISCOUNTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDiscount(String(p))}
                className={`rounded px-1.5 py-0.5 text-xs border transition ${
                  discount === String(p)
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                -{p}%
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max="99"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="% perso"
              className="w-20 rounded-md border border-gray-300 px-2 py-1 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
            />
            <button
              type="button"
              onClick={handleApply}
              className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700 transition"
            >
              Appliquer
            </button>
            {product.discountPercent && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-md border border-red-200 bg-red-50 p-1 text-red-600 hover:bg-red-100 transition"
                title="Supprimer la promo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {saved && (
          <p className="mt-1 text-xs text-emerald-600">Promotion appliquée.</p>
        )}
      </td>
      <td className="px-4 py-3">
        {product.discountPercent ? (
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 border border-red-200 flex items-center gap-1 w-fit">
            <Tag className="h-3 w-3" /> -{product.discountPercent}%
          </span>
        ) : (
          <span className="text-xs text-gray-400">Aucune</span>
        )}
      </td>
    </tr>
  );
};

const AdminPromotionsPage = () => {
  const { products } = useProducts();

  const promoCount = products.filter((p) => p.discountPercent).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Promotions & Prix</h1>
        <p className="text-sm text-gray-500 mt-1">
          {promoCount} produit(s) en promotion sur {products.length}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Produit</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Catégorie</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Prix actuel</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Appliquer une réduction</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Statut</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <PromotionRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromotionsPage;
