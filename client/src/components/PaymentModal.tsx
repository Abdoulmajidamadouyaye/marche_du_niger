"use client";

import { useCustomer } from "@/context/CustomerContext";
import { PaymentMethod } from "@/types";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Smartphone, CreditCard, Banknote, X } from "lucide-react";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customer: {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
  }) => void | Promise<void>;
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  subtotal: number;
};

const paymentMethods: {
  value: PaymentMethod;
  name: string;
  details: string;
  highlights: string[];
  logos?: { src: string; alt: string }[];
  icon: typeof CreditCard;
}[] = [
  {
    value: "card",
    name: "Carte Visa",
    details: "Paiement par carte bancaire en FCFA selon votre banque.",
    highlights: ["Visa", "Paiement securise", "Utilisable pour les achats en ligne"],
    logos: [{ src: "/payments/visa.jpg", alt: "Logo Visa" }],
    icon: CreditCard,
  },
  {
    value: "mynita",
    name: "MyNITA",
    details: "Paiements mobiles dominants au Niger pour achats, transferts et reglement de factures.",
    highlights: ["MyNITA", "Factures et transfert d'argent"],
    logos: [
      { src: "/payments/mynita.png", alt: "Logo MyNITA" },
    ],
    icon: Smartphone,
  },
  {
    value: "amana",
    name: "AmanaTa",
    details: "Paiements mobiles dominants au Niger pour achats, transferts et reglement de factures.",
    highlights: ["AmanaTa", "Factures et transfert d'argent"],
    logos: [
      { src: "/payments/amana.png", alt: "Logo AmanaTa" },
    ],
    icon: Smartphone,
  },
  {
    value: "cod",
    name: "Paiement cash en FCFA",
    details: "Reglement a la livraison dans les zones couvertes.",
    highlights: ["Franc CFA", "Paiement a reception", "Zones partenaires"],
    icon: Banknote,
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(price);

const PaymentModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedMethod,
  onMethodChange,
  subtotal,
}: PaymentModalProps) => {
  const { customer } = useCustomer();
  const [isClosing, setIsClosing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [formError, setFormError] = useState("");

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 180);
  }, [isClosing, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (!isOpen || !customer) return;
    setFirstName(customer.firstName);
    setLastName(customer.lastName);
    setPhone(customer.phone);
    if (!city) {
      setCity("Niamey");
    }
  }, [city, customer, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !city.trim()) {
      setFormError("Veuillez renseigner le nom, le prenom, le numero et la ville.");
      return;
    }

    const normalizedPhone = phone.replace(/\s+/g, "").trim();
    if (!/^\+?[0-9]{8,15}$/.test(normalizedPhone)) {
      setFormError("Numero invalide. Exemple: +22790000000");
      return;
    }

    setFormError("");
    await onConfirm({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: normalizedPhone,
      city: city.trim(),
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 md:items-center md:p-4 nm-touch-scroll ${
        isClosing ? "nm-modal-overlay-out" : "nm-modal-overlay"
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Confirmation du paiement"
    >
      <div
        className={`relative my-3 w-full max-w-2xl max-h-[92dvh] overflow-y-auto rounded-2xl bg-white shadow-2xl md:max-h-[88vh] nm-touch-scroll ${
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

        <div className="flex flex-col gap-5 p-5 md:p-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Confirmation du paiement</h2>
            <p className="mt-1 text-sm text-gray-600">
              Revoyez vos donnees et confirmez votre commande
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-lg font-semibold text-gray-900">Récapitulatif</h3>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-gray-700">Sous-total</span>
              <span className="text-2xl font-bold text-emerald-700">{formatPrice(subtotal)}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Méthode de paiement</h3>
            <div className="flex flex-col gap-2.5">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.value;

                return (
                  <label
                    key={method.value}
                    className={`cursor-pointer rounded-lg border p-4 transition ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => onMethodChange(method.value)}
                    />
                    <div className="flex items-center gap-2 text-gray-900">
                      <Icon className="h-5 w-5" />
                      <p className="font-semibold">{method.name}</p>
                    </div>

                    {method.logos && method.logos.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {method.logos.map((logo) => (
                          <div
                            key={logo.src}
                            className="overflow-hidden rounded-xl border border-gray-200 bg-white px-2 py-1"
                          >
                            <Image
                              src={logo.src}
                              alt={logo.alt}
                              width={40}
                              height={40}
                              className="h-10 w-auto object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="mt-2 text-sm text-gray-600">{method.details}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {method.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-600"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Informations client</h3>
            {customer && (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Compte connecte: {customer.firstName} {customer.lastName} ({customer.phone})
              </p>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Prenom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                  placeholder="Ex: Issa"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                  placeholder="Ex: Abdou"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Numero de telephone</label>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                placeholder="+22790000000"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Ville</label>
              <input
                type="text"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                placeholder="Ex: Niamey"
              />
            </div>
            {formError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-md border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Confirmer la commande
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
