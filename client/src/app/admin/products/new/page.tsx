"use client";

import { useProducts } from "@/context/ProductsContext";
import { useFloatingNotice } from "@/context/FloatingNoticeContext";
import {
  MotoBreaks,
  MotoEngineType,
  MotoSpecs,
  MotoType,
  MotoUsage,
  ProductType,
  VehicleCondition,
  VehicleSpecs,
  Country,
} from "@/types";
import { apiUploadImages } from "@/services/api";
import { NIGER_REGIONS } from "@/constants/regions";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
  { name: "Habillement", slug: "habillement" },
  { name: "Chaussures", slug: "chaussures" },
  { name: "Sacs", slug: "sacs" },
  { name: "Accessoires", slug: "accessoires" },
  { name: "Téléphones", slug: "telephones" },
  { name: "Informatique", slug: "informatique" },
  { name: "Voitures", slug: "voitures" },
  { name: "Motos", slug: "motos" },
];

type FormData = {
  name: string;
  shortDescription: string;
  description: string;
  price: string;
  category: string;
  categorySlug: string;
  sizes: string;
  inStock: boolean;
  imageUrl: string;
  country?: Country;
  regions: string[];
  shippingDelayDays: string;
};

type VehicleSpecsFormData = {
  brand: string;
  model: string;
  year: string;
  engineType: VehicleSpecs["engineType"];
  horsepower: string;
  transmission: VehicleSpecs["transmission"];
  fuelConsumption: string;
  autonomy: string;
  tankCapacity: string;
  mileage: string;
  doors: string;
  seats: string;
  color: string;
  airbags: boolean;
  abs: boolean;
  reverseCamera: boolean;
  airConditioning: boolean;
  gpsNavigation: boolean;
  touchScreen: boolean;
  condition: VehicleCondition;
  papersAvailable: boolean;
};

type MotoSpecsFormData = {
  brand: string;
  model: string;
  year: string;
  motoType: MotoType;
  engineType: MotoEngineType;
  maxSpeed: string;
  weight: string;
  color: string;
  tireType: string;
  mileage: string;
  usage: MotoUsage;
  fuelConsumption: string;
  tankCapacity: string;
  brakes: MotoBreaks;
  antiTheft: boolean;
  ledLighting: boolean;
  electricStart: boolean;
  digitalDashboard: boolean;
  condition: VehicleCondition;
  papersAvailable: boolean;
};

const ENGINE_TYPES: VehicleSpecs["engineType"][] = ["Essence", "Diesel", "Hybride", "Electrique"];
const TRANSMISSIONS: VehicleSpecs["transmission"][] = ["Automatique", "Manuelle"];
const CONDITIONS: VehicleCondition[] = ["neuf", "occasion"];

const MOTO_TYPES: MotoType[] = ["Sport", "Cross", "Scooter", "Routière", "Autre"];
const MOTO_ENGINE_TYPES: MotoEngineType[] = ["2 temps", "4 temps"];
const MOTO_USAGES: MotoUsage[] = ["ville", "route", "tout-terrain"];
const MOTO_BRAKES: MotoBreaks[] = ["disque", "tambour", "disque + tambour"];

const defaultFormData: FormData = {
  name: "",
  shortDescription: "",
  description: "",
  price: "",
  category: "Habillement",
  categorySlug: "habillement",
  sizes: "",
  inStock: true,
  imageUrl: "",
  country: undefined,
  regions: [],
  shippingDelayDays: "",
};

const defaultVehicleSpecsFormData: VehicleSpecsFormData = {
  brand: "",
  model: "",
  year: "",
  engineType: "Essence",
  horsepower: "",
  transmission: "Automatique",
  fuelConsumption: "",
  autonomy: "",
  tankCapacity: "",
  mileage: "",
  doors: "",
  seats: "",
  color: "",
  airbags: true,
  abs: true,
  reverseCamera: false,
  airConditioning: true,
  gpsNavigation: false,
  touchScreen: false,
  condition: "occasion",
  papersAvailable: true,
};

const defaultMotoSpecsFormData: MotoSpecsFormData = {
  brand: "",
  model: "",
  year: "",
  motoType: "Scooter",
  engineType: "4 temps",
  maxSpeed: "",
  weight: "",
  color: "",
  tireType: "",
  mileage: "",
  usage: "ville",
  fuelConsumption: "",
  tankCapacity: "",
  brakes: "disque",
  antiTheft: false,
  ledLighting: false,
  electricStart: true,
  digitalDashboard: false,
  condition: "occasion",
  papersAvailable: true,
};

const inputCls = (hasError: boolean) =>
  `w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-300"
      : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-300"
  }`;

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

const AdminAddProductPage = () => {
  const { addProduct } = useProducts();
  const { notify } = useFloatingNotice();
  const router = useRouter();

  const [form, setForm] = useState<FormData>(defaultFormData);
  const [vehicleSpecs, setVehicleSpecs] = useState<VehicleSpecsFormData>(defaultVehicleSpecsFormData);
  const [motoSpecs, setMotoSpecs] = useState<MotoSpecsFormData>(defaultMotoSpecsFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [localImageNames, setLocalImageNames] = useState<string[]>([]);
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);

  const isCarCategory = form.categorySlug === "voitures";
  const isMotoCategory = form.categorySlug === "motos";

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) newErrors.name = "Le nom est requis.";
    if (!form.shortDescription.trim()) newErrors.shortDescription = "La description courte est requise.";
    if (!form.description.trim()) newErrors.description = "La description est requise.";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      newErrors.price = "Prix invalide.";
    }
    if (galleryImageUrls.length === 0 && !form.imageUrl.trim()) {
      newErrors.imageUrl = "Au moins une image est requise.";
    }

    if (isCarCategory) {
      if (!vehicleSpecs.brand.trim()) newErrors.name = "La marque de la voiture est requise.";
      if (!vehicleSpecs.model.trim()) newErrors.shortDescription = "Le modele de la voiture est requis.";
      if (!vehicleSpecs.year || isNaN(Number(vehicleSpecs.year))) {
        newErrors.description = "L'annee de fabrication est invalide.";
      }
    }

    if (isMotoCategory) {
      if (!motoSpecs.brand.trim()) newErrors.name = "La marque de la moto est requise.";
      if (!motoSpecs.model.trim()) newErrors.shortDescription = "Le modele de la moto est requis.";
      if (!motoSpecs.year || isNaN(Number(motoSpecs.year))) {
        newErrors.description = "L'annee de fabrication est invalide.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategoryChange = (name: string) => {
    const found = CATEGORIES.find((c) => c.name === name);
    setForm((prev) => ({
      ...prev,
      category: name,
      categorySlug: found?.slug ?? name.toLowerCase(),
    }));
  };

  const handleLocalImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;

    try {
      notify("Téléchargement des images...", "info", 0);
      const urls = await apiUploadImages(files);
      const validUrls = urls.filter(Boolean);
      if (validUrls.length === 0) return;

      setLocalImageNames((prev) => [...prev, ...files.map((file) => file.name)]);
      setGalleryImageUrls((prev) => {
        const next = [...prev, ...validUrls];
        setForm((current) => ({ ...current, imageUrl: next[0] ?? "" }));
        return next;
      });
      setErrors((prev) => ({ ...prev, imageUrl: undefined }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors du telechargement des images.";
      notify(message, "error", 4000);
    } finally {
      event.target.value = "";
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setGalleryImageUrls((prev) => {
      const next = prev.filter((_, index) => index !== indexToRemove);
      setForm((current) => ({ ...current, imageUrl: next[0] ?? "" }));
      return next;
    });

    setLocalImageNames((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const buildVehicleSpecs = (): VehicleSpecs => ({
    brand: vehicleSpecs.brand.trim(),
    model: vehicleSpecs.model.trim(),
    year: Number(vehicleSpecs.year),
    engineType: vehicleSpecs.engineType,
    horsepower: Number(vehicleSpecs.horsepower || 0),
    transmission: vehicleSpecs.transmission,
    fuelConsumption: Number(vehicleSpecs.fuelConsumption || 0),
    autonomy: Number(vehicleSpecs.autonomy || 0),
    tankCapacity: Number(vehicleSpecs.tankCapacity || 0),
    mileage: Number(vehicleSpecs.mileage || 0),
    doors: Number(vehicleSpecs.doors || 0),
    seats: Number(vehicleSpecs.seats || 0),
    color: vehicleSpecs.color.trim(),
    airbags: vehicleSpecs.airbags,
    abs: vehicleSpecs.abs,
    reverseCamera: vehicleSpecs.reverseCamera,
    airConditioning: vehicleSpecs.airConditioning,
    gpsNavigation: vehicleSpecs.gpsNavigation,
    touchScreen: vehicleSpecs.touchScreen,
    condition: vehicleSpecs.condition,
    papersAvailable: vehicleSpecs.papersAvailable,
  });

  const buildMotoSpecs = (): MotoSpecs => ({
    brand: motoSpecs.brand.trim(),
    model: motoSpecs.model.trim(),
    year: Number(motoSpecs.year),
    motoType: motoSpecs.motoType,
    engineType: motoSpecs.engineType,
    maxSpeed: Number(motoSpecs.maxSpeed || 0),
    weight: Number(motoSpecs.weight || 0),
    color: motoSpecs.color.trim(),
    tireType: motoSpecs.tireType.trim(),
    mileage: Number(motoSpecs.mileage || 0),
    usage: motoSpecs.usage,
    fuelConsumption: Number(motoSpecs.fuelConsumption || 0),
    tankCapacity: Number(motoSpecs.tankCapacity || 0),
    brakes: motoSpecs.brakes,
    antiTheft: motoSpecs.antiTheft,
    ledLighting: motoSpecs.ledLighting,
    electricStart: motoSpecs.electricStart,
    digitalDashboard: motoSpecs.digitalDashboard,
    condition: motoSpecs.condition,
    papersAvailable: motoSpecs.papersAvailable,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      notify("Veuillez corriger les champs du formulaire.", "error", 3200);
      return;
    }

    const finalImages = (galleryImageUrls.length > 0
      ? galleryImageUrls
      : form.imageUrl.trim()
      ? [form.imageUrl.trim()]
      : []
    ).filter(Boolean);

    const imageRecord = Object.fromEntries(
      finalImages.map((image, index) => [`image${index + 1}`, image]),
    );

    const product: Omit<ProductType, "id"> = {
      name: form.name.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      categorySlug: form.categorySlug,
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      inStock: form.inStock,
      colors: Object.keys(imageRecord),
      images: imageRecord,
      vehicleSpecs: isCarCategory ? buildVehicleSpecs() : undefined,
      motoSpecs: isMotoCategory ? buildMotoSpecs() : undefined,
      country: form.country,
      regions: form.regions.length > 0 ? form.regions : undefined,
      shippingDelayDays:
        form.country === "benin" && form.shippingDelayDays.trim() !== ""
          ? Number(form.shippingDelayDays)
          : undefined,
    };

    setSaving(true);
    setApiError("");
    notify("Enregistrement du produit...", "info", 1800);
    try {
      await addProduct(product);
      notify("Produit ajoute avec succes.", "success", 2800);
      router.push("/admin/products");
    } catch {
      setApiError("Erreur lors de la création. Vérifiez que le serveur est démarré.");
      notify("Erreur lors de la creation du produit.", "error", 3600);
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl pb-12">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Ajouter un produit</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        {apiError && <p className="text-sm text-red-600 rounded-md bg-red-50 px-3 py-2">{apiError}</p>}

        <Field label="Nom du produit" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls(!!errors.name)}
            placeholder="Ex: T-shirt Premium"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Catégorie">
            <select
              aria-label="Catégorie du produit"
              title="Catégorie du produit"
              value={form.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={inputCls(false)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Prix (FCFA)" error={errors.price}>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={inputCls(!!errors.price)}
              placeholder="Ex: 6000"
            />
          </Field>
        </div>

        <Field label="Description courte" error={errors.shortDescription}>
          <input
            type="text"
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            className={inputCls(!!errors.shortDescription)}
            placeholder="Résumé du produit"
          />
        </Field>

        <Field label="Description complète" error={errors.description}>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputCls(!!errors.description)}
            placeholder="Détails du produit"
          />
        </Field>

        <Field label="Images du produit (plusieurs fichiers)" error={errors.imageUrl}>
          <div className="space-y-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
              <Upload className="h-3.5 w-3.5" />
              Joindre des images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleLocalImageSelect}
              />
            </label>

            {localImageNames.length > 0 && (
              <p className="text-xs text-gray-600">{localImageNames.length} image(s) selectionnee(s)</p>
            )}

            {localImageNames.length === 0 && (
              <p className="text-xs text-gray-500">Aucun fichier selectionne</p>
            )}

            {galleryImageUrls.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryImageUrls.map((image, index) => (
                  <div key={`${index}-${image.slice(0, 18)}`} className="relative h-16 w-16 shrink-0 rounded-md border border-gray-200 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={`Apercu ${index + 1}`} className="h-full w-full rounded-md object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute -right-2 -top-2 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                      aria-label={`Supprimer image ${index + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Field>

        <Field label="Tailles disponibles (séparées par des virgules, optionnel)">
          <input
            type="text"
            value={form.sizes}
            onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            className={inputCls(false)}
            placeholder="S, M, L, XL"
          />
        </Field>

        {isCarCategory && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Caracteristiques voiture</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Marque">
                <input type="text" value={vehicleSpecs.brand} onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, brand: e.target.value }))} className={inputCls(false)} placeholder="Toyota" />
              </Field>
              <Field label="Modele">
                <input type="text" value={vehicleSpecs.model} onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, model: e.target.value }))} className={inputCls(false)} placeholder="RAV4" />
              </Field>
              <Field label="Annee de fabrication">
                <input type="number" min="1900" value={vehicleSpecs.year} onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, year: e.target.value }))} className={inputCls(false)} placeholder="2025" />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Type de moteur">
                <select aria-label="Type de moteur" title="Type de moteur" value={vehicleSpecs.engineType} onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, engineType: e.target.value as VehicleSpecs["engineType"] }))} className={inputCls(false)}>
                  {ENGINE_TYPES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Puissance (chevaux)">
                <input type="number" min="1" value={vehicleSpecs.horsepower} onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, horsepower: e.target.value }))} className={inputCls(false)} placeholder="180" />
              </Field>
              <Field label="Boite">
                <select aria-label="Type de boite" title="Type de boite" value={vehicleSpecs.transmission} onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, transmission: e.target.value as VehicleSpecs["transmission"] }))} className={inputCls(false)}>
                  {TRANSMISSIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Consommation (L/100km)">
                <input type="number" min="0" step="0.1" value={vehicleSpecs.fuelConsumption} onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, fuelConsumption: e.target.value }))} className={inputCls(false)} placeholder="7.5" />
              </Field>
              <Field label="Autonomie (km)">
                <input type="number" min="0" value={vehicleSpecs.autonomy} onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, autonomy: e.target.value }))} className={inputCls(false)} placeholder="650" />
              </Field>
              <Field label="Capacite reservoir (L)">
                <input type="number" min="0" value={vehicleSpecs.tankCapacity} onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, tankCapacity: e.target.value }))} className={inputCls(false)} placeholder="55" />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Field label="Kilometrage (km)">
                <input type="number" min="0" value={vehicleSpecs.mileage} onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, mileage: e.target.value }))} className={inputCls(false)} placeholder="12000" />
              </Field>
              <Field label="Portes">
                <input type="number" min="1" value={vehicleSpecs.doors} onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, doors: e.target.value }))} className={inputCls(false)} placeholder="5" />
              </Field>
              <Field label="Places">
                <input type="number" min="1" value={vehicleSpecs.seats} onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, seats: e.target.value }))} className={inputCls(false)} placeholder="5" />
              </Field>
              <Field label="Couleur">
                <input type="text" value={vehicleSpecs.color} onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, color: e.target.value }))} className={inputCls(false)} placeholder="Blanc" />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Etat">
                <select aria-label="Etat du vehicule" title="Etat du vehicule" value={vehicleSpecs.condition} onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, condition: e.target.value as VehicleCondition }))} className={inputCls(false)}>
                  {CONDITIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700">
              {[
                { key: "airbags", label: "Airbags" },
                { key: "abs", label: "ABS" },
                { key: "reverseCamera", label: "Camera de recul" },
                { key: "airConditioning", label: "Climatisation" },
                { key: "gpsNavigation", label: "GPS / Navigation" },
                { key: "touchScreen", label: "Ecran tactile" },
                { key: "papersAvailable", label: "Papiers disponibles" },
              ].map((feature) => (
                <label key={feature.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vehicleSpecs[feature.key as keyof VehicleSpecsFormData] as boolean}
                    onChange={(e) => setVehicleSpecs((prev) => ({ ...prev, [feature.key]: e.target.checked }))}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  {feature.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {isMotoCategory && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Caracteristiques moto</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Marque">
                <input type="text" value={motoSpecs.brand} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, brand: e.target.value }))} className={inputCls(false)} placeholder="Yamaha" />
              </Field>
              <Field label="Modele">
                <input type="text" value={motoSpecs.model} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, model: e.target.value }))} className={inputCls(false)} placeholder="MT-07" />
              </Field>
              <Field label="Annee de fabrication">
                <input type="number" min="1900" value={motoSpecs.year} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, year: e.target.value }))} className={inputCls(false)} placeholder="2023" />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Type de moto">
                <select aria-label="Type de moto" title="Type de moto" value={motoSpecs.motoType} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, motoType: e.target.value as MotoType }))} className={inputCls(false)}>
                  {MOTO_TYPES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Type de moteur">
                <select aria-label="Type de moteur moto" title="Type de moteur moto" value={motoSpecs.engineType} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, engineType: e.target.value as MotoEngineType }))} className={inputCls(false)}>
                  {MOTO_ENGINE_TYPES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Vitesse max (km/h)">
                <input type="number" min="0" value={motoSpecs.maxSpeed} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, maxSpeed: e.target.value }))} className={inputCls(false)} placeholder="160" />
              </Field>
              <Field label="Poids (kg)">
                <input type="number" min="0" value={motoSpecs.weight} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, weight: e.target.value }))} className={inputCls(false)} placeholder="180" />
              </Field>
              <Field label="Couleur">
                <input type="text" value={motoSpecs.color} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, color: e.target.value }))} className={inputCls(false)} placeholder="Noir" />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Type de pneus">
                <input type="text" value={motoSpecs.tireType} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, tireType: e.target.value }))} className={inputCls(false)} placeholder="Radial tubeless" />
              </Field>
              <Field label="Kilometrage (km)">
                <input type="number" min="0" value={motoSpecs.mileage} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, mileage: e.target.value }))} className={inputCls(false)} placeholder="5000" />
              </Field>
              <Field label="Usage">
                <select aria-label="Usage de la moto" title="Usage de la moto" value={motoSpecs.usage} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, usage: e.target.value as MotoUsage }))} className={inputCls(false)}>
                  {MOTO_USAGES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Consommation (L/100km)">
                <input type="number" min="0" step="0.1" value={motoSpecs.fuelConsumption} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, fuelConsumption: e.target.value }))} className={inputCls(false)} placeholder="3.5" />
              </Field>
              <Field label="Capacite reservoir (L)">
                <input type="number" min="0" value={motoSpecs.tankCapacity} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, tankCapacity: e.target.value }))} className={inputCls(false)} placeholder="14" />
              </Field>
              <Field label="Freins">
                <select aria-label="Type de freins" title="Type de freins" value={motoSpecs.brakes} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, brakes: e.target.value as MotoBreaks }))} className={inputCls(false)}>
                  {MOTO_BRAKES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Etat">
                <select aria-label="Etat de la moto" title="Etat de la moto" value={motoSpecs.condition} onChange={(e) => setMotoSpecs((prev) => ({ ...prev, condition: e.target.value as VehicleCondition }))} className={inputCls(false)}>
                  {CONDITIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700">
              {[
                { key: "antiTheft", label: "Antivol" },
                { key: "ledLighting", label: "Eclairage LED" },
                { key: "electricStart", label: "Demarrage electrique" },
                { key: "digitalDashboard", label: "Tableau de bord digital" },
                { key: "papersAvailable", label: "Papiers disponibles" },
              ].map((feature) => (
                <label key={feature.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={motoSpecs[feature.key as keyof MotoSpecsFormData] as boolean}
                    onChange={(e) => setMotoSpecs((prev) => ({ ...prev, [feature.key]: e.target.checked }))}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  {feature.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {(isCarCategory || isMotoCategory) && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Disponibilité géographique</h3>

            <Field label="Pays de disponibilité">
              <select
                aria-label="Pays de disponibilité"
                title="Pays de disponibilité"
                value={form.country || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    country: (e.target.value as Country) || undefined,
                    regions: [],
                    shippingDelayDays: "",
                  }))
                }
                className={inputCls(false)}
              >
                <option value="">-- Sélectionner un pays --</option>
                <option value="niger">🇳🇪 Niger</option>
                <option value="benin">🇧🇯 Benin (Cotonou)</option>
              </select>
            </Field>

            {form.country === "niger" && (
              <Field label="Regions du Niger">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {NIGER_REGIONS.map((region) => (
                    <label key={region.code} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.regions.includes(region.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm((prev) => ({
                              ...prev,
                              regions: [...prev.regions, region.code],
                            }));
                          } else {
                            setForm((prev) => ({
                              ...prev,
                              regions: prev.regions.filter((r) => r !== region.code),
                            }));
                          }
                        }}
                        className="h-4 w-4 accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        {region.name} ({region.code})
                      </span>
                    </label>
                  ))}
                </div>
              </Field>
            )}

            {form.country === "benin" && (
              <Field label="Delai d'expedition (jours)">
                <input
                  type="number"
                  min="0"
                  value={form.shippingDelayDays}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, shippingDelayDays: e.target.value }))
                  }
                  className={inputCls(false)}
                  placeholder="Ex: 3"
                />
              </Field>
            )}
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
            className="h-4 w-4 accent-emerald-600"
          />
          Produit en stock
        </label>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Ajouter le produit"}
          </button>
          <Link
            href="/admin/products"
            className="rounded-md border border-gray-300 px-5 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AdminAddProductPage;
