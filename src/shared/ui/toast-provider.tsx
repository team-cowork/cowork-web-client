"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import { Toast } from "@/shared/ui/toast";

export interface ToastOptions {
  icon?: ReactNode;
  action?: ReactNode;
  /** 자동 닫힘까지의 ms. 0 이하면 자동으로 닫지 않음. */
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, options?: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx)
    throw new Error("useToast는 ToastProvider 내부에서만 사용할 수 있습니다");
  return ctx;
}

export function ToastProvider({
  children,
  duration = 4000,
}: {
  children: ReactNode;
  duration?: number;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = (idRef.current += 1);
      setToasts((prev) => [...prev, { id, message, ...options }]);
      const ttl = options?.duration ?? duration;
      if (ttl > 0) setTimeout(() => dismiss(id), ttl);
      return id;
    },
    [duration, dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
            {toasts.map((t) => (
              <Toast
                key={t.id}
                message={t.message}
                icon={t.icon}
                action={t.action}
                className="pointer-events-auto"
              />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
