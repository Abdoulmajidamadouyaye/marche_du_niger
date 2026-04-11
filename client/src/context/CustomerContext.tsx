"use client";

import {
  apiCustomerLogin,
  apiCustomerMe,
  apiCustomerRegister,
} from "@/services/api";
import { CustomerType } from "@/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type CustomerContextType = {
  customer: CustomerType | null;
  loading: boolean;
  register: (
    firstName: string,
    lastName: string,
    phone: string,
    email: string,
    password: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("nm_customer_token") : null;

    if (!token) {
      setLoading(false);
      return;
    }

    apiCustomerMe()
      .then(setCustomer)
      .catch(() => {
        localStorage.removeItem("nm_customer_token");
        setCustomer(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const register = async (
    firstName: string,
    lastName: string,
    phone: string,
    email: string,
    password: string
  ) => {
    const result = await apiCustomerRegister(firstName, lastName, phone, email, password);
    localStorage.setItem("nm_customer_token", result.accessToken);
    setCustomer(result.customer);
  };

  const login = async (email: string, password: string) => {
    const result = await apiCustomerLogin(email, password);
    localStorage.setItem("nm_customer_token", result.accessToken);
    setCustomer(result.customer);
  };

  const logout = () => {
    localStorage.removeItem("nm_customer_token");
    setCustomer(null);
  };

  return (
    <CustomerContext.Provider value={{ customer, loading, register, login, logout }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) throw new Error("useCustomer must be used within CustomerProvider");
  return context;
};