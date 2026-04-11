"use client";

import { CartItemType, OrderStatus, OrderType, PaymentMethod } from "@/types";
import {
  apiCreateOrder,
  apiDeleteOrder,
  apiGetOrders,
  apiUpdateOrderStatus,
} from "@/services/api";
import { useFloatingNotice } from "@/context/FloatingNoticeContext";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type OrdersContextType = {
  orders: OrderType[];
  refreshOrders: () => void;
  addOrder: (
    items: CartItemType[],
    subtotal: number,
    paymentMethod: PaymentMethod,
    customer: {
      firstName: string;
      lastName: string;
      phone: string;
      city?: string;
    }
  ) => Promise<boolean>;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const { notify } = useFloatingNotice();

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("nm_admin_token")) {
      apiGetOrders().then(setOrders).catch(console.error);
    }
  }, []);

  const refreshOrders = () => {
    if (typeof window !== "undefined" && localStorage.getItem("nm_admin_token")) {
      apiGetOrders().then(setOrders).catch(console.error);
    }
  };

  const addOrder = (
    items: CartItemType[],
    subtotal: number,
    paymentMethod: PaymentMethod,
    customer: {
      firstName: string;
      lastName: string;
      phone: string;
      city?: string;
    }
  ) => {
    notify("Validation de la commande en cours...", "info", 2200);
    return apiCreateOrder(items, subtotal, paymentMethod, customer)
      .then((order) => {
        setOrders((prev) => [order, ...prev]);
        notify("Commande validee avec succes.", "success", 3200);
        return true;
      })
      .catch((err) => {
        console.error(err);
        notify("Echec de la validation de la commande.", "error", 3800);
        return false;
      });
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    apiUpdateOrderStatus(id, status)
      .then((updated) =>
        setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
      )
      .catch(console.error);
  };

  const deleteOrder = (id: string) => {
    const previous = orders;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    notify("Suppression de la commande...", "info", 1800);
    apiDeleteOrder(id)
      .then(() => {
        notify("Commande supprimee.", "success", 2600);
      })
      .catch((err) => {
        console.error(err);
        setOrders(previous);
        notify("Erreur lors de la suppression de la commande.", "error", 3600);
      });
  };

  return (
    <OrdersContext.Provider value={{ orders, refreshOrders, addOrder, updateOrderStatus, deleteOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) throw new Error("useOrders must be used within OrdersProvider");
  return context;
};
