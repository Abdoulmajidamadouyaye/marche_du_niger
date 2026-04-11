"use client";

import { useEffect, useMemo, useState } from "react";
import { useFloatingNotice } from "@/context/FloatingNoticeContext";

const toneClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
} as const;

const barClasses = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  info: "bg-sky-500",
} as const;

const FloatingNotice = () => {
  const { notice, clearNotice } = useFloatingNotice();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!notice) return;

    const timer = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, [notice]);

  useEffect(() => {
    if (!notice) return;

    const remaining = notice.startedAt + notice.durationMs - now;
    if (remaining <= 0) {
      clearNotice();
    }
  }, [notice, now, clearNotice]);

  const progress = useMemo(() => {
    if (!notice) return 0;
    const elapsed = now - notice.startedAt;
    const ratio = 1 - elapsed / notice.durationMs;
    return Math.max(0, Math.min(1, ratio));
  }, [notice, now]);

  const secondsLeft = useMemo(() => {
    if (!notice) return 0;
    return Math.max(0, Math.ceil((notice.startedAt + notice.durationMs - now) / 1000));
  }, [notice, now]);

  if (!notice) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] w-[min(92vw,360px)]">
      <div className={`pointer-events-auto overflow-hidden rounded-xl border shadow-lg ${toneClasses[notice.kind]}`}>
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <p className="text-sm font-medium">{notice.message}</p>
          <button
            type="button"
            onClick={clearNotice}
            className="rounded px-1 text-xs font-semibold opacity-70 transition hover:opacity-100"
            aria-label="Fermer la notification"
            title="Fermer la notification"
          >
            X
          </button>
        </div>
        <div className="flex items-center justify-between px-4 pb-2 text-xs opacity-80">
          <span>Fermeture automatique</span>
          <span>{secondsLeft}s</span>
        </div>
        <div className="h-1.5 w-full bg-black/10">
          <div
            className={`h-full transition-[width] duration-100 ${barClasses[notice.kind]}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default FloatingNotice;
