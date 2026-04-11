"use client";

import { ProductType } from "@/types";
import { getCountryFlag } from "@/constants/regions";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useEffect, useMemo, useState } from "react";

type ProductCardProps = {
  product: ProductType;
  onPreview: (product: ProductType) => void;
};

const ProductCard = ({ product, onPreview }: ProductCardProps) => {
  const { addToCart } = useCart();

  const galleryImages = useMemo(() => {
    const values = product.images && typeof product.images === "object"
      ? Object.values(product.images).filter(Boolean)
      : [];
    const unique = Array.from(new Set(values));
    return unique.length > 0 ? unique : ["/products/placeholder.png"];
  }, [product.images]);

  const [activeImage, setActiveImage] = useState(galleryImages[0]);
  const shouldAutoRotate =
    product.categorySlug === "voitures" || product.categorySlug === "motos";
  const imageMotionClass = "object-contain hover:scale-105 transition-all duration-300";

  useEffect(() => {
    setActiveImage(galleryImages[0]);
  }, [galleryImages]);

  useEffect(() => {
    if (!shouldAutoRotate || galleryImages.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveImage((current) => {
        const currentIndex = galleryImages.indexOf(current);
        const safeIndex = currentIndex >= 0 ? currentIndex : 0;
        return galleryImages[(safeIndex + 1) % galleryImages.length];
      });
    }, 2600);

    return () => window.clearInterval(interval);
  }, [galleryImages, shouldAutoRotate]);
  
  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div
      className="w-full max-w-[340px] shadow-lg rounded-lg overflow-hidden bg-white border border-gray-100 transition hover:shadow-xl cursor-pointer"
      onClick={() => onPreview(product)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onPreview(product);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Voir les details de ${product.name}`}
    >
      <div className="relative block w-full text-left">
        <div className="relative w-full bg-gray-50" style={{ aspectRatio: "3/4" }}>
          {activeImage.startsWith("data:") ? (
            // Image base64
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeImage}
              alt={product.name}
              className={`w-full h-full ${imageMotionClass}`}
            />
          ) : (
            // Image URL
            <Image
              key={activeImage}
              src={activeImage}
              alt={product.name}
              fill
              className={imageMotionClass}
            />
          )}

          {galleryImages.length > 1 && (
            <div className="absolute bottom-2 left-2 right-2 z-10 flex gap-1.5 overflow-x-auto rounded-md bg-white/85 p-1.5 backdrop-blur-sm">
              {galleryImages.map((image, index) => {
                const selected = image === activeImage;
                return (
                  <button
                    key={`${index}-${image.slice(0, 18)}`}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveImage(image);
                    }}
                    className={`relative h-10 w-10 shrink-0 overflow-hidden rounded border transition ${
                      selected ? "border-emerald-500 ring-1 ring-emerald-300" : "border-gray-200"
                    }`}
                    aria-label={`Voir image ${index + 1}`}
                  >
                    {image.startsWith("data:") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                    ) : (
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <h3 className="font-semibold text-gray-900 leading-tight">{product.name}</h3>
            {product.country && (
              <div className="flex items-center gap-2">
                <span className="text-sm">{getCountryFlag(product.country)}</span>
                {product.country === "benin" && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                    ⏱️ {product.shippingDelayDays ?? 0}j
                  </span>
                )}
              </div>
            )}
          </div>
          <span className="text-sm font-bold text-emerald-700 whitespace-nowrap">{formattedPrice}</span>
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{product.category}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{product.shortDescription}</p>

        {product.sizes && product.sizes.length > 0 && (
          <p className="text-xs text-gray-500">Tailles: {product.sizes.join(", ")}</p>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            addToCart(product);
          }}
          className="mt-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

