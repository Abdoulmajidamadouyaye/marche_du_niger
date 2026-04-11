"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { useFloatingNotice } from "@/context/FloatingNoticeContext";
import PaymentModal from "./PaymentModal";

const PaymentMethods = () => {
  const {
    items,
    subtotal,
    paymentMethod,
    setPaymentMethod,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
  } = useCart();
  const { addOrder } = useOrders();
  const { notify } = useFloatingNotice();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const openWhatsAppCart = () => {
    const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "22790000000").replace(/\D+/g, "");
    const lines = [
      "Bonjour, je veux discuter de ma commande avant de finaliser.",
      "",
      ...items.map(
        (item) =>
          `- ${item.product.name} x${item.quantity} = ${item.product.price * item.quantity} FCFA`,
      ),
      "",
      `Total: ${subtotal} FCFA`,
    ];
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
    notify("Redirection vers WhatsApp...", "info", 1800);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formattedSubtotal = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        maximumFractionDigits: 0,
      }).format(subtotal),
    [subtotal]
  );

  const handleOpenPaymentModal = () => {
    if (items.length === 0) {
      setSuccessMessage("Votre panier est vide. Ajoutez au moins un produit.");
      return;
    }

    setSuccessMessage("");
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (customer: {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
  }) => {
    const created = await addOrder(items, subtotal, paymentMethod, customer);
    if (!created) {
      setSuccessMessage("Echec de la commande. Verifiez votre connexion et reessayez.");
      return;
    }

    setSuccessMessage("Commande validee avec succes. Merci pour votre achat.");
    clearCart();
    setIsPaymentModalOpen(false);
  };

  return (
    <>
      <section
        id="checkout"
        className="mt-14 rounded-xl border border-gray-200 bg-white p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900">Panier et paiement</h2>
        <p className="mt-1 text-sm text-gray-600">
          Ajustez les quantites de votre panier puis passez a l&apos;etape de paiement.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900">Votre panier</h3>

            {items.length === 0 ? (
              <p className="mt-3 text-sm text-gray-600">Aucun produit dans le panier.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                {items.map((item) => {
                  const lineTotal = new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "XOF",
                    maximumFractionDigits: 0,
                  }).format(item.product.price * item.quantity);

                  return (
                    <div
                      key={item.product.id}
                      className="rounded-md border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">{lineTotal}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-500 transition hover:text-red-600"
                          aria-label="Retirer du panier"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decreaseQty(item.product.id)}
                          className="rounded border border-gray-300 px-2 py-1 text-sm"
                        >
                          -
                        </button>
                        <span className="min-w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => increaseQty(item.product.id)}
                          className="rounded border border-gray-300 px-2 py-1 text-sm"
                        >
                          +
                        </button>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 border-t border-gray-200 pt-3">
              <p className="text-sm text-gray-600">Sous-total</p>
              <p className="text-lg font-bold text-gray-900">{formattedSubtotal}</p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900">Paiement</h3>
            <p className="mt-2 text-sm text-gray-600">
              Ouvrez la fenetre de paiement pour choisir votre methode et confirmer la commande.
            </p>

            <button
              type="button"
              onClick={handleOpenPaymentModal}
              className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Proceder au paiement
            </button>

            <button
              type="button"
              onClick={openWhatsAppCart}
              disabled={items.length === 0}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-40"
            >
              <MessageCircle className="h-4 w-4" />
              Discuter sur WhatsApp
            </button>

            {successMessage && (
              <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                {successMessage}
              </p>
            )}
          </div>
        </div>
      </section>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handleConfirmPayment}
        selectedMethod={paymentMethod}
        onMethodChange={setPaymentMethod}
        subtotal={subtotal}
      />
    </>
  );
};

export default PaymentMethods;
