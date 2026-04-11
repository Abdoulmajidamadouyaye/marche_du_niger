"use client";

import { useOrders } from "@/context/OrdersContext";
import { useProducts } from "@/context/ProductsContext";
import { OrderItemType, OrderStatus, OrderType } from "@/types";
import { useMemo } from "react";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "in_delivery", label: "En livraison" },
  { value: "shipped", label: "En livraison (ancien)" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
];

const paymentLabels: Record<string, string> = {
  card: "Carte Visa",
  mynita: "MyNITA",
  amana: "AmanaTa",
  cod: "Cash en FCFA",
};

const statusColors: Record<OrderStatus, string> = {
  pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
  confirmed: "text-blue-700 bg-blue-50 border-blue-200",
  in_delivery: "text-purple-700 bg-purple-50 border-purple-200",
  shipped: "text-purple-700 bg-purple-50 border-purple-200",
  delivered: "text-emerald-700 bg-emerald-50 border-emerald-200",
  cancelled: "text-red-700 bg-red-50 border-red-200",
};

const fmt = (price: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(price);

const formatPhone = (rawPhone: string | undefined) => {
  const compact = (rawPhone ?? "").replace(/\s+/g, "").trim();
  if (!compact) return "Non renseigne";

  if (compact.startsWith("+227") && compact.length === 12) {
    const local = compact.slice(4);
    const chunks = local.match(/.{1,2}/g);
    return chunks ? `+227 ${chunks.join(" ")}` : compact;
  }

  if (compact.startsWith("+")) {
    return compact.replace(/(\+\d{1,3})(\d+)/, (_, cc, rest) => `${cc} ${rest}`);
  }

  const chunks = compact.match(/.{1,2}/g);
  return chunks ? chunks.join(" ") : compact;
};

const capitalizeWord = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";

const formatFullName = (firstName: string | undefined, lastName: string | undefined) => {
  const parts = [firstName ?? "", lastName ?? ""]
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) =>
      part
        .split(/[-\s]+/)
        .map(capitalizeWord)
        .join(" ")
    );

  return parts.join(" ").trim() || "Non renseigne";
};

const OrderRow = ({
  order,
  resolveImageSrc,
}: {
  order: OrderType;
  resolveImageSrc: (item: OrderItemType) => string;
}) => {
  const { updateOrderStatus, deleteOrder } = useOrders();
  const safeStatus: OrderStatus = STATUS_OPTIONS.some((opt) => opt.value === order.status)
    ? order.status
    : "pending";
  const safeItems = Array.isArray(order.items) ? order.items : [];
  const createdAt = new Date(order.createdAt);
  const formattedDate = Number.isNaN(createdAt.getTime())
    ? "Date invalide"
    : createdAt.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  const fullName = formatFullName(order.customerFirstName, order.customerLastName);
  const customerPhone = formatPhone(order.customerPhone);
  const handleDelete = () => {
    const confirmed = window.confirm(
      `Supprimer la commande ${order.id} ? Cette action est irreversible.`
    );
    if (!confirmed) return;
    deleteOrder(order.id);
  };

  return (
    <tr className="border-b border-gray-200 last:border-0 align-top">
      <td className="px-4 py-3 font-mono text-xs text-gray-700">{order.id}</td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {formattedDate}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{fullName}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{customerPhone}</td>
      <td className="px-4 py-3 text-sm text-gray-600">
        <ul className="space-y-2">
          {safeItems.map((item) => (
            <li key={`${item.productId}-${item.productName}`} className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-md border border-gray-200 bg-gray-50 shrink-0">
                <img
                  src={resolveImageSrc(item)}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(event) => {
                    const target = event.currentTarget;
                    if (target.src.endsWith("/logo.png")) return;
                    target.src = "/logo.png";
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-700">{item.productName}</p>
                <p className="text-xs text-gray-500">Quantite : {item.quantity}</p>
              </div>
            </li>
          ))}
        </ul>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{fmt(order.subtotal)}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{paymentLabels[order.paymentMethod] ?? order.paymentMethod}</td>
      <td className="px-4 py-3">
        <select
          aria-label={`Statut de la commande ${order.id}`}
          title={`Statut de la commande ${order.id}`}
          value={safeStatus}
          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
          className={`rounded-md border px-2 py-1 text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-300 ${statusColors[safeStatus]}`}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
        >
          Supprimer
        </button>
      </td>
    </tr>
  );
};

const AdminOrdersPage = () => {
  const { orders } = useOrders();
  const { products } = useProducts();

  const productImageById = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of products) {
      const firstImage = Object.values(product.images ?? {})[0] ?? "";
      if (firstImage) {
        map.set(String(product.id), firstImage);
      }
    }
    return map;
  }, [products]);

  const normalizeImagePath = (rawImage: string | undefined) => {
    if (!rawImage) return "/logo.png";
    return rawImage.startsWith("http") || rawImage.startsWith("/") ? rawImage : `/${rawImage}`;
  };

  const resolveItemImage = (item: OrderItemType) => {
    const fromOrder = item.productImage?.trim();
    if (fromOrder) return normalizeImagePath(fromOrder);
    const fromCatalog = productImageById.get(String(item.productId));
    return normalizeImagePath(fromCatalog);
  };

  const totalRevenue = orders.reduce((acc, o) => acc + o.subtotal, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} commande(s) — Revenu total : {fmt(totalRevenue)}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-500">Aucune commande reçue pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
          <table className="w-full text-sm min-w-[920px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Réf.</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Client</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Téléphone</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Produits</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Montant</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Paiement</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Statut</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} resolveImageSrc={resolveItemImage} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
