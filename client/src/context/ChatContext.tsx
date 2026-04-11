"use client";

import {
  apiGetMyChatMessages,
  apiSendCustomerChatMessage,
} from "@/services/api";
import { ChatMessageType } from "@/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useFloatingNotice } from "./FloatingNoticeContext";

const WS_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const CUSTOMER_LAST_READ_KEY = "nm_customer_chat_last_read_at";

type ChatContextType = {
  messages: ChatMessageType[];
  isOpen: boolean;
  unreadCount: number;
  sending: boolean;
  isAuthenticated: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (message: string) => Promise<boolean>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { notify } = useFloatingNotice();

  const persistLastReadAt = useCallback((iso: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CUSTOMER_LAST_READ_KEY, iso);
  }, []);

  const getLastReadAt = useCallback(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(CUSTOMER_LAST_READ_KEY) ?? "";
  }, []);

  const getToken = useCallback((): { token: string; role: "customer" | "admin" } | null => {
    if (typeof window === "undefined") return null;
    const adminToken = localStorage.getItem("nm_admin_token");
    if (adminToken) return { token: adminToken, role: "admin" };
    const customerToken = localStorage.getItem("nm_customer_token");
    if (customerToken) return { token: customerToken, role: "customer" };
    return null;
  }, []);

  const loadMessages = useCallback(async () => {
    const auth = getToken();
    if (!auth || auth.role !== "customer") return;
    try {
      const msgs = await apiGetMyChatMessages();
      setMessages(msgs);
      setIsAuthenticated(true);

      const lastReadAt = getLastReadAt();
      const unreadFromAdmin = msgs.filter(
        (msg) =>
          msg.senderRole === "admin" &&
          (!lastReadAt || new Date(msg.createdAt).getTime() > new Date(lastReadAt).getTime()),
      ).length;
      setUnreadCount(unreadFromAdmin);
    } catch {
      // silently ignore
    }
  }, [getToken, getLastReadAt]);

  useEffect(() => {
    const auth = getToken();
    if (!auth) {
      setIsAuthenticated(false);
      return undefined;
    }

    const socket = io(`${WS_URL}/chat`, {
      transports: ["websocket"],
      autoConnect: false,
    });

    socketRef.current = socket;
    socket.connect();

    socket.on("connect", () => {
      socket.emit("join", { token: auth.token });
    });

    socket.on("joined", (data: { role: string }) => {
      if (data.role === "customer" || data.role === "admin") {
        setIsAuthenticated(true);
        void loadMessages();
      }
    });

    socket.on("message:new", (msg: ChatMessageType) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setIsOpen((open) => {
        if (msg.senderRole === "admin") {
          if (open) {
            persistLastReadAt(msg.createdAt);
          } else {
            setUnreadCount((c) => c + 1);
          }
        }
        return open;
      });
    });

    socket.on("disconnect", () => {
      setIsAuthenticated(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);

    setMessages((prev) => {
      const latestAdminMessage = [...prev]
        .filter((msg) => msg.senderRole === "admin")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      if (latestAdminMessage) {
        persistLastReadAt(latestAdminMessage.createdAt);
      }
      return prev;
    });
  }, [persistLastReadAt]);

  const closeChat = useCallback(() => setIsOpen(false), []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        setUnreadCount(0);
        const latestAdminMessage = [...messages]
          .filter((msg) => msg.senderRole === "admin")
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        if (latestAdminMessage) {
          persistLastReadAt(latestAdminMessage.createdAt);
        }
      }
      return !prev;
    });
  }, [messages, persistLastReadAt]);

  const sendMessage = useCallback(
    async (message: string): Promise<boolean> => {
      const trimmed = message.trim();
      if (!trimmed) return false;

      setSending(true);
      try {
        const created = await apiSendCustomerChatMessage(trimmed);
        setMessages((prev) => {
          if (prev.some((m) => m.id === created.id)) return prev;
          return [...prev, created];
        });
        notify("Message envoye.", "success", 2000);
        return true;
      } catch {
        notify("Echec de l'envoi du message.", "error", 3400);
        return false;
      } finally {
        setSending(false);
      }
    },
    [notify],
  );

  const value = useMemo(
    () => ({ messages, isOpen, unreadCount, sending, isAuthenticated, toggleChat, openChat, closeChat, sendMessage }),
    [messages, isOpen, unreadCount, sending, isAuthenticated, toggleChat, openChat, closeChat, sendMessage],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};
