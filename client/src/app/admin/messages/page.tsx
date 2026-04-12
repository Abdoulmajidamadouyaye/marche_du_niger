"use client";

import {
  apiGetConversation,
  apiGetConversationSummaries,
  apiSendAdminChatMessage,
} from "@/services/api";
import { ChatMessageType, ConversationSummaryType } from "@/types";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useFloatingNotice } from "@/context/FloatingNoticeContext";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";

const WS_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const ADMIN_LAST_READ_KEY = "nm_admin_chat_last_read_by_customer";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

const AdminMessagesPage = () => {
  const [summaries, setSummaries] = useState<ConversationSummaryType[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { notify } = useFloatingNotice();
  const [lastReadByCustomer, setLastReadByCustomer] = useState<Record<string, string>>({});

  useEffect(() => {
    const raw = localStorage.getItem(ADMIN_LAST_READ_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      setLastReadByCustomer(parsed);
    } catch {
      setLastReadByCustomer({});
    }
  }, []);

  const markConversationAsRead = useCallback((customerId: string, iso: string) => {
    setLastReadByCustomer((prev) => {
      const next = { ...prev, [customerId]: iso };
      localStorage.setItem(ADMIN_LAST_READ_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const refreshSummaries = useCallback(async () => {
    try {
      const data = await apiGetConversationSummaries();
      setSummaries(data);
    } catch {
      /* ignore */
    }
  }, []);

  const openConversation = useCallback(async (customerId: string) => {
    setSelectedId(customerId);
    try {
      const msgs = await apiGetConversation(customerId);
      setMessages(msgs);
      const latestCustomerMsg = [...msgs]
        .filter((msg) => msg.senderRole === "customer")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      if (latestCustomerMsg) {
        markConversationAsRead(customerId, latestCustomerMsg.createdAt);
      }
    } catch {
      notify("Impossible de charger la conversation.", "error", 3200);
    }
  }, [markConversationAsRead, notify]);

  // Initial load of summaries
  useEffect(() => {
    void refreshSummaries();
  }, [refreshSummaries]);

  // Socket.io for real-time push to admin
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("nm_admin_token") : null;
    if (!token) return;

    const socket = io(`${WS_URL}/chat`, { transports: ["websocket"], autoConnect: false });
    socketRef.current = socket;
    socket.connect();

    socket.on("connect", () => {
      socket.emit("join", { token });
    });

    socket.on("message:new", (msg: ChatMessageType) => {
      // Update open conversation if it matches
      setSelectedId((currentId) => {
        if (currentId === msg.customerId) {
          setMessages((prev) => {
            const alreadyIn = prev.some((m) => m.id === msg.id);
            return alreadyIn ? prev : [...prev, msg];
          });
          if (msg.senderRole === "customer") {
            markConversationAsRead(msg.customerId, msg.createdAt);
          }
        }
        return currentId;
      });
      // Refresh summaries to update last message
      void refreshSummaries();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [markConversationAsRead, refreshSummaries]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedId || !draft.trim()) return;
    setSending(true);
    try {
      const msg = await apiSendAdminChatMessage(selectedId, draft.trim());
      setMessages((prev) => {
        const alreadyIn = prev.some((m) => m.id === msg.id);
        return alreadyIn ? prev : [...prev, msg];
      });
      setDraft("");
      notify("Message envoyé.", "success", 2000);
      void refreshSummaries();
    } catch {
      notify("Echec de l'envoi du message.", "error", 3400);
    } finally {
      setSending(false);
    }
  };

  const selectedSummary = summaries.find((s) => s.customerId === selectedId);
  const unreadCountByCustomer = summaries.reduce<Record<string, number>>((acc, summary) => {
    const lastReadAt = lastReadByCustomer[summary.customerId];
    const hasUnread =
      summary.lastSenderRole === "customer" &&
      (!lastReadAt || new Date(summary.lastAt).getTime() > new Date(lastReadAt).getTime());
    acc[summary.customerId] = hasUnread ? 1 : 0;
    return acc;
  }, {});
  const totalUnread = Object.values(unreadCountByCustomer).reduce((total, count) => total + count, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Boite de reception clients</h1>
            <p className="text-sm text-gray-500">Suivi des conversations en temps reel</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700">
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
          messages non lus
        </div>
      </div>

      <div className="flex h-[calc(100dvh-215px)] overflow-hidden rounded-xl border border-gray-200 bg-white md:h-[calc(100vh-140px)]">
      {/* Left: conversation list */}
      <aside className={`w-full shrink-0 overflow-y-auto border-gray-200 md:w-72 md:border-r ${selectedId ? "hidden md:block" : "block"}`}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Conversations clients</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {summaries.length} client(s) - {totalUnread} non lu(s)
          </p>
        </div>
        {summaries.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">Aucune conversation.</p>
        ) : (
          <ul>
            {summaries.map((s) => (
              <li key={s.customerId}>
                {(() => {
                  const unread = unreadCountByCustomer[s.customerId] ?? 0;
                  const isUnread = unread > 0;
                  return (
                <button
                  type="button"
                  onClick={() => openConversation(s.customerId)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                    selectedId === s.customerId ? "bg-emerald-50 border-l-2 border-l-emerald-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-sm ${isUnread ? "font-bold text-gray-900" : "font-medium text-gray-900"}`}>
                      {s.customerName}
                    </p>
                    {isUnread && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
                        {unread}
                      </span>
                    )}
                  </div>
                  <p className={`mt-0.5 truncate text-xs ${isUnread ? "font-semibold text-gray-700" : "text-gray-500"}`}>
                    {s.lastMessage}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{formatDate(s.lastAt)}</p>
                </button>
                  );
                })()}
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Right: conversation view */}
      <div className={`min-w-0 flex-1 flex-col ${selectedId ? "flex" : "hidden md:flex"}`}>
        {selectedId ? (
          <>
            <div className="border-b border-gray-200 bg-gray-50 px-3 py-3 sm:px-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-1.5 text-gray-600 md:hidden"
                aria-label="Retour aux conversations"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-semibold text-gray-900">
                {selectedSummary?.customerName ?? selectedId}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto space-y-2 px-3 py-3 sm:px-4 sm:py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[88%] rounded-lg px-3 py-2 text-sm md:max-w-[75%] ${
                    msg.senderRole === "admin"
                      ? "ml-auto bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-[11px] font-semibold opacity-70 mb-0.5">
                    {msg.senderRole === "admin" ? msg.senderName : msg.senderName}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <p className="mt-1 text-[10px] opacity-50 text-right">{formatDate(msg.createdAt)}</p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="sticky bottom-0 border-t border-gray-200 bg-white p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-3 flex items-center gap-2"
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Répondre au client..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
                maxLength={1000}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-emerald-700 sm:px-4"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Envoyer</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            <div className="text-center space-y-2">
              <MessageSquare className="h-10 w-10 mx-auto opacity-30" />
              <p className="text-sm">Sélectionnez une conversation</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminMessagesPage;
