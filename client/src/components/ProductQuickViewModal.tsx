"use client";

import { useCart } from "@/context/CartContext";
import { ProductType } from "@/types";
import { getCountryFlag, getCountryLabel, NIGER_REGIONS } from "@/constants/regions";
import {
  BadgeCheck,
  Bike,
  Camera,
  Car,
  CheckCircle,
  Circle,
  Droplet,
  FileText,
  Fuel,
  Gauge,
  Lightbulb,
  Lock,
  Map,
  Monitor,
  Palette,
  Power,
  Route,
  Ruler,
  Settings,
  Shield,
  Sliders,
  Tag,
  Weight,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

type ProductQuickViewModalProps = {
  product: ProductType;
  onClose: () => void;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(price);

const Spec = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1.5">
    <span className="text-emerald-700">{icon}</span>
    <span className="font-medium text-gray-900">{label}:</span>
    <span>{value}</span>
  </div>
);

const ProductQuickViewModal = ({ product, onClose }: ProductQuickViewModalProps) => {
  const { addToCart } = useCart();
  const [isClosing, setIsClosing] = useState(false);
  const galleryImages = useMemo(() => {
    const values = Object.values(product.images ?? {}).filter(Boolean);
    const unique = Array.from(new Set(values));
    return unique.length > 0 ? unique : ["/products/placeholder.png"];
  }, [product.images]);
  const [activeImage, setActiveImage] = useState<string>(galleryImages[0]);

  const vehicleSpecs = product.categorySlug === "voitures" ? product.vehicleSpecs : undefined;
  const motoSpecs = product.categorySlug === "motos" ? product.motoSpecs : undefined;

  useEffect(() => {
    setActiveImage(galleryImages[0]);
  }, [galleryImages]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => onClose(), 180);
  }, [isClosing, onClose]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [handleClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 md:items-center md:p-4 nm-touch-scroll ${
        isClosing ? "nm-modal-overlay-out" : "nm-modal-overlay"
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Details du produit ${product.name}`}
    >
      <div
        className={`relative my-3 w-full max-w-5xl max-h-[92dvh] overflow-y-auto rounded-2xl bg-white shadow-2xl md:max-h-[88vh] nm-touch-scroll ${
          isClosing ? "nm-modal-panel-out" : "nm-modal-panel"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex min-h-[320px] flex-col bg-gray-50 md:min-h-[520px]">
            <div className="relative min-h-[260px] flex-1">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="border-t border-gray-200 bg-white/80 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Galerie produit</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryImages.map((image, index) => {
                  const selected = image === activeImage;
                  return (
                    <button
                      key={`${index}-${image.slice(0, 18)}`}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border transition ${
                        selected
                          ? "border-emerald-500 ring-2 ring-emerald-200"
                          : "border-gray-200 hover:border-emerald-300"
                      }`}
                      aria-label={`Voir image ${index + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6 md:p-8 md:max-h-[520px] md:overflow-y-auto nm-touch-scroll">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{product.category}</p>
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-emerald-700">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
              {product.discountPercent && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                  -{product.discountPercent}%
                </span>
              )}
            </div>

            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Caracteristiques</h3>
              <p className="text-sm text-gray-600">{product.shortDescription}</p>
              <p className="text-sm text-gray-700">{product.description}</p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Disponibilite: </span>
                {product.inStock !== false ? "En stock" : "Rupture de stock"}
              </p>
              {product.sizes && product.sizes.length > 0 && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Tailles: </span>
                  {product.sizes.join(", ")}
                </p>
              )}
            </div>

            {product.country && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Disponibilité géographique</h3>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCountryFlag(product.country)}</span>
                  <span className="font-medium text-gray-800">{getCountryLabel(product.country)}</span>
                  {product.country === "benin" && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      ⏱️ Délai: {product.shippingDelayDays ?? 0} jour(s)
                    </span>
                  )}
                </div>

                {product.country === "niger" && product.regions && product.regions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Disponible dans les régions:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.regions.map((regionCode) => {
                        const region = NIGER_REGIONS.find((r) => r.code === regionCode);
                        return region ? (
                          <span key={region.code} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700">
                            {region.name} <span className="text-gray-400">({region.code})</span>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {product.country === "benin" && (
                    <p className="text-xs text-gray-600 italic">
                      Livraison à Cotonou avec délai d&apos;expédition de {product.shippingDelayDays ?? 0} jour(s).
                    </p>
                )}
              </div>
            )}

            {vehicleSpecs && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Fiche technique voiture</h3>

                <div className="rounded-md border border-gray-100 bg-gray-50 p-3 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600">Infos Generales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                    <Spec icon={<Car className="h-4 w-4" />} label="Marque" value={vehicleSpecs.brand} />
                    <Spec icon={<BadgeCheck className="h-4 w-4" />} label="Modele" value={vehicleSpecs.model} />
                    <Spec icon={<BadgeCheck className="h-4 w-4" />} label="Annee" value={String(vehicleSpecs.year)} />
                    <Spec icon={<Palette className="h-4 w-4" />} label="Couleur" value={vehicleSpecs.color} />
                    <Spec icon={<Tag className="h-4 w-4" />} label="Portes" value={String(vehicleSpecs.doors)} />
                    <Spec icon={<Tag className="h-4 w-4" />} label="Places" value={String(vehicleSpecs.seats)} />
                    <Spec icon={<FileText className="h-4 w-4" />} label="Etat" value={vehicleSpecs.condition} />
                    <Spec icon={<CheckCircle className="h-4 w-4" />} label="Papiers" value={vehicleSpecs.papersAvailable ? "Oui" : "Non"} />
                  </div>
                </div>

                <div className="rounded-md border border-gray-100 bg-gray-50 p-3 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600">Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                    <Spec icon={<Fuel className="h-4 w-4" />} label="Moteur" value={vehicleSpecs.engineType} />
                    <Spec icon={<Gauge className="h-4 w-4" />} label="Puissance" value={`${vehicleSpecs.horsepower} ch`} />
                    <Spec icon={<Settings className="h-4 w-4" />} label="Boite" value={vehicleSpecs.transmission} />
                    <Spec icon={<Droplet className="h-4 w-4" />} label="Consommation" value={`${vehicleSpecs.fuelConsumption} L/100km`} />
                    <Spec icon={<Fuel className="h-4 w-4" />} label="Reservoir" value={`${vehicleSpecs.tankCapacity} L`} />
                    <Spec icon={<Route className="h-4 w-4" />} label="Kilometrage" value={`${vehicleSpecs.mileage} km`} />
                  </div>
                </div>

                <div className="rounded-md border border-gray-100 bg-gray-50 p-3 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600">Securite et Equipements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                    <Spec icon={<Shield className="h-4 w-4" />} label="Airbags" value={vehicleSpecs.airbags ? "Oui" : "Non"} />
                    <Spec icon={<Shield className="h-4 w-4" />} label="ABS" value={vehicleSpecs.abs ? "Oui" : "Non"} />
                    <Spec icon={<Camera className="h-4 w-4" />} label="Camera" value={vehicleSpecs.reverseCamera ? "Oui" : "Non"} />
                    <Spec icon={<Map className="h-4 w-4" />} label="GPS" value={vehicleSpecs.gpsNavigation ? "Oui" : "Non"} />
                    <Spec icon={<Monitor className="h-4 w-4" />} label="Ecran tactile" value={vehicleSpecs.touchScreen ? "Oui" : "Non"} />
                  </div>
                </div>
              </div>
            )}

            {motoSpecs && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Fiche technique moto</h3>

                <div className="rounded-md border border-gray-100 bg-gray-50 p-3 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600">Infos Generales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                    <Spec icon={<Bike className="h-4 w-4" />} label="Marque" value={motoSpecs.brand} />
                    <Spec icon={<Tag className="h-4 w-4" />} label="Modele" value={motoSpecs.model} />
                    <Spec icon={<BadgeCheck className="h-4 w-4" />} label="Annee" value={String(motoSpecs.year)} />
                    <Spec icon={<Sliders className="h-4 w-4" />} label="Type moto" value={motoSpecs.motoType} />
                    <Spec icon={<Palette className="h-4 w-4" />} label="Couleur" value={motoSpecs.color} />
                    <Spec icon={<Circle className="h-4 w-4" />} label="Pneus" value={motoSpecs.tireType} />
                    <Spec icon={<Map className="h-4 w-4" />} label="Usage" value={motoSpecs.usage} />
                    <Spec icon={<FileText className="h-4 w-4" />} label="Etat" value={motoSpecs.condition} />
                    <Spec icon={<CheckCircle className="h-4 w-4" />} label="Papiers" value={motoSpecs.papersAvailable ? "Oui" : "Non"} />
                    <Spec icon={<Zap className="h-4 w-4" />} label="Etat general" value={motoSpecs.condition === "neuf" ? "Neuf" : "Occasion"} />
                  </div>
                </div>

                <div className="rounded-md border border-gray-100 bg-gray-50 p-3 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600">Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                    <Spec icon={<Settings className="h-4 w-4" />} label="Moteur" value={motoSpecs.engineType} />
                    <Spec icon={<Gauge className="h-4 w-4" />} label="Vitesse" value={`${motoSpecs.maxSpeed} km/h`} />
                    <Spec icon={<Weight className="h-4 w-4" />} label="Poids" value={`${motoSpecs.weight} kg`} />
                    <Spec icon={<Route className="h-4 w-4" />} label="Kilometrage" value={`${motoSpecs.mileage} km`} />
                    <Spec icon={<Droplet className="h-4 w-4" />} label="Consommation" value={`${motoSpecs.fuelConsumption} L/100km`} />
                    <Spec icon={<Fuel className="h-4 w-4" />} label="Reservoir" value={`${motoSpecs.tankCapacity} L`} />
                    <Spec icon={<Ruler className="h-4 w-4" />} label="Freins" value={motoSpecs.brakes} />
                  </div>
                </div>

                <div className="rounded-md border border-gray-100 bg-gray-50 p-3 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600">Securite et Equipements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                    <Spec icon={<Lock className="h-4 w-4" />} label="Antivol" value={motoSpecs.antiTheft ? "Oui" : "Non"} />
                    <Spec icon={<Lightbulb className="h-4 w-4" />} label="LED" value={motoSpecs.ledLighting ? "Oui" : "Non"} />
                    <Spec icon={<Power className="h-4 w-4" />} label="Demarrage electrique" value={motoSpecs.electricStart ? "Oui" : "Non"} />
                    <Spec icon={<Monitor className="h-4 w-4" />} label="Tableau digital" value={motoSpecs.digitalDashboard ? "Oui" : "Non"} />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-auto flex gap-3">
              <button
                type="button"
                onClick={() => addToCart(product)}
                className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Ajouter au panier
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickViewModal;
