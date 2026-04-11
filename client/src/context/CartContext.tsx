"use client";

import { CartItemType, PaymentMethod, ProductType } from "@/types";
import { useFloatingNotice } from "@/context/FloatingNoticeContext";
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

type CartContextType = {
  items: CartItemType[];
  totalItems: number;
  subtotal: number;
  paymentMethod: PaymentMethod;
  addToCart: (product: ProductType) => void;
  increaseQty: (productId: ProductType["id"]) => void;
  decreaseQty: (productId: ProductType["id"]) => void;
  removeFromCart: (productId: ProductType["id"]) => void;
  clearCart: () => void;
  setPaymentMethod: (value: PaymentMethod) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const { notify } = useFloatingNotice();

  const addToCart = (product: ProductType) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);

      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { product, quantity: 1 }];
    });

    notify(`${product.name} ajoute au panier.`, "success", 1800);
  };

  const increaseQty = (productId: ProductType["id"]) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (productId: ProductType["id"]) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: ProductType["id"]) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        paymentMethod,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        setPaymentMethod,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};
