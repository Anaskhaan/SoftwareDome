"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle, AlertCircle, Info, X } from "@/lib/fa-icons";
import type { StatusTone } from "@/lib/design-tokens";

interface ToastItem {
  id: number;
  tone: Extract<StatusTone, "success" | "danger" | "info">;
  message: string;
}

interface ToastContextValue {
  show: (message: string, tone?: ToastItem["tone"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastItem["tone"], { icon: React.ElementType; classes: string }> = {
  success: { icon: CheckCircle, classes: "bg-status-success-bg text-status-success border-status-success/20" },
  danger: { icon: AlertCircle, classes: "bg-status-danger-bg text-status-danger border-status-danger/20" },
  info: { icon: Info, classes: "bg-status-info-bg text-status-info border-status-info/20" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, tone: ToastItem["tone"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, tone, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2">
        {toasts.map((t) => {
          const { icon: Icon, classes } = toneStyles[t.tone];
          return (
            <div
              key={t.id}
              className={`anim-pop-in flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${classes} bg-white`}
            >
              <Icon size={16} />
              <span className="max-w-xs">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="ml-2 opacity-60 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
