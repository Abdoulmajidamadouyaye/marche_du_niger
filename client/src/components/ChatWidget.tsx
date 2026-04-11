"use client";

import { useChat } from "@/context/ChatContext";
import { useCustomer } from "@/context/CustomerContext";
import { useFloatingNotice } from "@/context/FloatingNoticeContext";
import { MessageCircle, Send, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

const ChatWidget = () => {
  const { customer } = useCustomer();
  const { messages, isOpen, unreadCount, toggleChat, closeChat, sendMessage, sending } = useChat();
  const { notify } = useFloatingNotice();
  const [draft, setDraft] = useState("");
  // Resolve admin status after mount to avoid SSR/client hydration mismatch
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(Boolean(localStorage.getItem("nm_admin_token")));
  }, []);

  const isCustomerLoggedIn = Boolean(customer);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages],
  );

  // Pure admin users don't need the customer chat widget
  if (isAdmin && !isCustomerLoggedIn) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    if (!isCustomerLoggedIn) {
      notify("Connectez-vous pour envoyer un message.", "error", 3200);
      return;
    }

    const sent = await sendMessage(trimmed);
    if (sent) setDraft("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-[70]">
      {isOpen && (
        <div className="mb-3 w-[92vw] max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">MARCHÉ DU NIGER</p>
              {customer ? (
                <p className="text-xs text-emerald-600">
                  Connecte {customer.firstName} {customer.lastName}
                </p>
              ) : (
                <p className="text-xs text-gray-400">Posez votre question</p>
              )}
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="rounded-full border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-100"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto px-3 py-3">
            {sortedMessages.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun message. Posez votre question !</p>
            ) : (
              sortedMessages.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    item.senderRole === "admin"
                      ? "ml-4 bg-emerald-50 text-emerald-900"
                      : "mr-4 bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide opacity-60">
                    {item.senderRole === "admin" ? "MARCHÉ DU NIGER" : "Vous"}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap">{item.message}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={isCustomerLoggedIn ? "Votre message..." : "Ecrivez votre message..."}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {!isCustomerLoggedIn && (
              <p className="text-center text-xs text-gray-400">
                <Link href="/login" onClick={closeChat} className="text-emerald-600 hover:underline font-medium">
                  Connectez-vous
                </Link>{" "}
                pour envoyer un message
              </p>
            )}
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={toggleChat}
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl transition hover:bg-emerald-700"
        aria-label="Chat support"
      >
        <MessageCircle className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
