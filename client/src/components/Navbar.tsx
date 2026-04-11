"use client";

import Link from "next/link";
import Image from "next/image";
import SearchBar from "./SearchBar";
import { Bell, Home, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useChat } from "@/context/ChatContext";
import { useCustomer } from "@/context/CustomerContext";
import { Suspense } from "react";

const Navbar = () => {
  const { totalItems } = useCart();
  const { unreadCount, openChat } = useChat();
  const { customer, logout } = useCustomer();

  return (
    <nav className="w-full border-b border-gray-200 pb-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
          <Image src="/logo.png" alt="MARCHÉ DU NIGER" width={38} height={38} />
          <p className="min-w-0 text-[13px] font-semibold leading-tight tracking-wide text-black sm:text-base">
            MARCHÉ DU NIGER
          </p>
        </Link>

        {customer ? (
          <div className="hidden items-center gap-2 sm:gap-3 md:flex">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-gray-500">Connecte</p>
              <p className="text-sm font-semibold text-gray-900">
                {customer.firstName} {customer.lastName}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:px-3 sm:text-sm"
            >
              Deconnexion
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="hidden rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 md:inline-flex md:text-sm"
          >
            <span>Se connecter / Creer un compte</span>
          </Link>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <Suspense
            fallback={<div className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50" />}
          >
            <SearchBar />
          </Suspense>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <Link href="/" aria-label="Accueil">
            <Home className="h-4 w-4 text-gray-600" />
          </Link>

          <button
            type="button"
            onClick={openChat}
            aria-label="Ouvrir les messages"
            className="relative"
          >
            <Bell className="h-4 w-4 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <a href="#checkout" className="relative" aria-label="Voir le panier">
            <ShoppingCart className="h-4 w-4 text-gray-600" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {totalItems}
              </span>
            )}
          </a>
        </div>
      </div>

      <div className="mt-3 md:hidden">
        {customer ? (
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Deconnexion
          </button>
        ) : (
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Se connecter
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
