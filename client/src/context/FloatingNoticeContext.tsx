"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type NoticeKind = "success" | "error" | "info";

export type FloatingNotice = {
  id: number;
  message: string;
  kind: NoticeKind;
  durationMs: number;
  startedAt: number;
};

type FloatingNoticeContextType = {
  notice: FloatingNotice | null;
  notify: (message: string, kind?: NoticeKind, durationMs?: number) => void;
  clearNotice: () => void;
};

const FloatingNoticeContext = createContext<FloatingNoticeContextType | undefined>(undefined);

export const FloatingNoticeProvider = ({ children }: { children: ReactNode }) => {
  const [notice, setNotice] = useState<FloatingNotice | null>(null);

  const clearNotice = useCallback(() => {
    setNotice(null);
  }, []);

  const notify = useCallback(
    (message: string, kind: NoticeKind = "info", durationMs = 3500) => {
      setNotice({
        id: Date.now(),
        message,
        kind,
        durationMs,
        startedAt: Date.now(),
      });
    },
    []
  );

  const value = useMemo(
    () => ({ notice, notify, clearNotice }),
    [notice, notify, clearNotice]
  );

  return <FloatingNoticeContext.Provider value={value}>{children}</FloatingNoticeContext.Provider>;
};

export const useFloatingNotice = () => {
  const context = useContext(FloatingNoticeContext);
  if (!context) {
    throw new Error("useFloatingNotice must be used within FloatingNoticeProvider");
  }
  return context;
};
