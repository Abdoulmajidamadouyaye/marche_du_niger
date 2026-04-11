"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import {
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Tag,
  X,
} from "lucide-react";
import { apiAdminMe, apiGetConversationSummaries } from "@/services/api";
import { useOrders } from "@/context/OrdersContext";

const ADMIN_LAST_READ_KEY = "nm_admin_chat_last_read_by_customer";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Produits", icon: Package, exact: false },
  { href: "/admin/orders", label: "Commandes", icon: ClipboardList, exact: false },
  { href: "/admin/promotions", label: "Promotions", icon: Tag, exact: false },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, exact: false },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { refreshOrders } = useOrders();
  const isLoginPage = pathname?.startsWith("/admin/login") ?? false;

  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    const token = localStorage.getItem("nm_admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    apiAdminMe()
      .then(() => {
        setAuthenticated(true);
        refreshOrders();
      })
      .catch(() => {
        localStorage.removeItem("nm_admin_token");
        router.replace("/admin/login");
      });
  }, [isLoginPage, router, refreshOrders]);

  useEffect(() => {
    if (isLoginPage || !authenticated) return;

    const computeUnread = async () => {
      try {
        const summaries = await apiGetConversationSummaries();
        const raw = localStorage.getItem(ADMIN_LAST_READ_KEY);
        const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};

        const count = summaries.reduce((acc, summary) => {
          const lastReadAt = map[summary.customerId];
          const hasUnread =
            summary.lastSenderRole === "customer" &&
            (!lastReadAt || new Date(summary.lastAt).getTime() > new Date(lastReadAt).getTime());
          return acc + (hasUnread ? 1 : 0);
        }, 0);

        setUnreadMessagesCount(count);
      } catch {
        setUnreadMessagesCount(0);
      }
    };

    void computeUnread();
    const interval = window.setInterval(() => {
      void computeUnread();
    }, 12000);

    return () => window.clearInterval(interval);
  }, [authenticated, isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem("nm_admin_token");
    router.replace("/admin/login");
  };

  const closeMobileNav = () => setMobileNavOpen(false);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-600">Verification de la session administrateur...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <div>
          <p className="text-sm font-bold text-gray-900">MARCHÉ DU NIGER</p>
          <p className="text-xs text-gray-500">Administration</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="rounded-md border border-gray-300 p-2 text-gray-700"
          aria-label="Ouvrir le menu admin"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeMobileNav}
          aria-label="Fermer le menu admin"
        />
      )}

      <div className="flex min-h-[calc(100vh-56px)] md:min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] bg-gray-900 text-gray-300 transition-transform md:static md:z-auto md:w-64 md:max-w-none md:translate-x-0 ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="p-5 border-b border-gray-700 flex items-center gap-3">
              <Image src="/logo.png" alt="NM" width={32} height={32} />
              <div>
                <p className="text-sm font-bold text-white">MARCHÉ DU NIGER</p>
                <p className="text-xs text-gray-500">Administration</p>
              </div>
              <button
                type="button"
                onClick={closeMobileNav}
                className="ml-auto rounded-md border border-gray-700 p-1.5 text-gray-300 md:hidden"
                aria-label="Fermer le menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileNav}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                    {item.href === "/admin/messages" && unreadMessagesCount > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
                        {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                      </span>
                    )}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-700 space-y-2">
              <Link
                href="/"
                onClick={closeMobileNav}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition"
              >
                Voir la boutique
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-red-900 hover:text-white transition"
              >
                <LogOut className="h-4 w-4" /> Deconnexion
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
