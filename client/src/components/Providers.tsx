"use client";

import { CartProvider } from "@/context/CartContext";
import ChatWidget from "@/components/ChatWidget";
import { ChatProvider } from "@/context/ChatContext";
import { CustomerProvider } from "@/context/CustomerContext";
import FloatingNotice from "@/components/FloatingNotice";
import { FloatingNoticeProvider } from "@/context/FloatingNoticeContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { ReactNode } from "react";

const Providers = ({ children }: { children: ReactNode }) => (
  <FloatingNoticeProvider>
    <ChatProvider>
      <ProductsProvider>
        <CustomerProvider>
          <OrdersProvider>
            <CartProvider>
              {children}
              <FloatingNotice />
              <ChatWidget />
            </CartProvider>
          </OrdersProvider>
        </CustomerProvider>
      </ProductsProvider>
    </ChatProvider>
  </FloatingNoticeProvider>
);

export default Providers;
