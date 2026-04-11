"use client";

import { useOrders } from "@/context/OrdersContext";
import { useProducts } from "@/context/ProductsContext";
import { apiGetCustomersCount, apiGetOrdersAnalytics } from "@/services/api";
import { useMemo } from "react";
import { ClipboardList, Package, ShoppingBag, Tag, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OrdersAnalyticsType } from "@/types";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "text-yellow-700 bg-yellow-50" },
  confirmed: { label: "Confirmée", color: "text-blue-700 bg-blue-50" },
  in_delivery: { label: "En livraison", color: "text-purple-700 bg-purple-50" },
  shipped: { label: "En livraison", color: "text-purple-700 bg-purple-50" },
  delivered: { label: "Livrée", color: "text-emerald-700 bg-emerald-50" },
  cancelled: { label: "Annulée", color: "text-red-700 bg-red-50" },
};

const fallbackStatus = {
  label: "Inconnu",
  color: "text-gray-700 bg-gray-100",
};

const AdminDashboard = () => {
  const { products } = useProducts();
  const { orders } = useOrders();
  const [usersCount, setUsersCount] = useState(0);
  const [analytics, setAnalytics] = useState<OrdersAnalyticsType>({
    ordersPerDay: [],
    topProducts: [],
    activeCities: [],
  });

  useEffect(() => {
    Promise.all([apiGetCustomersCount(), apiGetOrdersAnalytics()])
      .then(([customers, analyticsData]) => {
        setUsersCount(customers.count);
        setAnalytics(analyticsData);
      })
      .catch(() => {
        setUsersCount(0);
        setAnalytics({ ordersPerDay: [], topProducts: [], activeCities: [] });
      });
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((acc, o) => acc + o.subtotal, 0),
    [orders]
  );

  const promoCount = products.filter((p) => p.discountPercent).length;

  const stats = [
    {
      label: "Produits en ligne",
      value: products.length,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
      href: "/admin/products",
    },
    {
      label: "Commandes totales",
      value: orders.length,
      icon: ClipboardList,
      color: "bg-amber-50 text-amber-600",
      href: "/admin/orders",
    },
    {
      label: "Chiffre d'affaires",
      value: new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        maximumFractionDigits: 0,
      }).format(totalRevenue),
      icon: ShoppingBag,
      color: "bg-emerald-50 text-emerald-600",
      href: "/admin/orders",
    },
    {
      label: "En promotion",
      value: promoCount,
      icon: Tag,
      color: "bg-pink-50 text-pink-600",
      href: "/admin/promotions",
    },
    {
      label: "Utilisateurs inscrits",
      value: usersCount,
      icon: Users,
      color: "bg-indigo-50 text-indigo-600",
      href: "/admin",
    },
  ];

  const recentOrders = orders.slice(0, 5);
  const todayOrders = analytics.ordersPerDay.length
    ? analytics.ordersPerDay[analytics.ordersPerDay.length - 1]?.count ?? 0
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-1">Bienvenue dans l&apos;espace administrateur MARCHÉ DU NIGER.</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-xl bg-white border border-gray-200 p-5 hover:shadow-md transition"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900">Commandes / jour</h2>
          <p className="mt-1 text-sm text-gray-500">Aujourd&apos;hui : {todayOrders}</p>
          <div className="mt-4 space-y-2">
            {analytics.ordersPerDay.slice(-7).map((entry) => (
              <div key={entry.date} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{new Date(entry.date).toLocaleDateString("fr-FR")}</span>
                <span className="font-semibold text-gray-900">{entry.count}</span>
              </div>
            ))}
            {analytics.ordersPerDay.length === 0 && (
              <p className="text-sm text-gray-500">Aucune donnée pour le moment.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900">Produits les plus vendus</h2>
          <div className="mt-4 space-y-2">
            {analytics.topProducts.slice(0, 5).map((product) => (
              <div key={`${product.productId}-${product.productName}`} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-gray-700">{product.productName}</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {product.quantity}
                </span>
              </div>
            ))}
            {analytics.topProducts.length === 0 && (
              <p className="text-sm text-gray-500">Aucune vente enregistrée.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900">Villes actives</h2>
          <div className="mt-4 space-y-2">
            {analytics.activeCities.slice(0, 5).map((city) => (
              <div key={city.city} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{city.city}</span>
                <span className="font-semibold text-gray-900">{city.count}</span>
              </div>
            ))}
            {analytics.activeCities.length === 0 && (
              <p className="text-sm text-gray-500">Renseignez la ville lors des commandes pour alimenter cette vue.</p>
            )}
          </div>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Commandes récentes</h2>
          <Link href="/admin/orders" className="text-sm text-emerald-600 hover:underline">
            Voir toutes →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune commande pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Réf.</th>
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Montant</th>
                  <th className="pb-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const s = statusLabels[order.status] ?? fallbackStatus;
                  const orderDate = Number.isNaN(new Date(order.createdAt).getTime())
                    ? "Date invalide"
                    : new Date(order.createdAt).toLocaleDateString("fr-FR");
                  return (
                    <tr key={order.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-4 font-mono text-xs text-gray-700">{order.id}</td>
                      <td className="py-2 pr-4 text-gray-600">{orderDate}</td>
                      <td className="py-2 pr-4 font-medium text-gray-900">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "XOF",
                          maximumFractionDigits: 0,
                        }).format(order.subtotal)}
                      </td>
                      <td className="py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.color}`}>
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
