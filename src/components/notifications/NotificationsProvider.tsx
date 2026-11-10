/**
 * Centraliza notificaciones UI (toasts + confirmaciones) para evitar acoplamiento y duplicación por pantalla.
 * Expone una API mínima (notify y confirm) para componentes cliente.
 */
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, MutableRefObject } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ToastData } from "@/components/ui/Toast";
import { Toaster } from "@/components/ui/Toaster";
import { ConfirmInput, NotifyInput } from "@/components/notifications/types";
import { consumeFlashNotifies } from "@/components/notifications/flashNotify";

type ConfirmRequest = ConfirmInput & {
  id: string;
  resolve: (value: boolean) => void;
};

type NotificationsApi = {
  notify: (input: NotifyInput) => string;
  dismiss: (id: string) => void;
  confirm: (input: ConfirmInput) => Promise<boolean>;
};

// Contexto para proporcionar la API de notificaciones.
const NotificationsContext = createContext<NotificationsApi | null>(null);

function createId(counterRef: MutableRefObject<number>) {
  counterRef.current += 1;
  return `n_${Date.now()}_${counterRef.current}`;
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const counterRef = useRef(0);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (input: NotifyInput) => {
      const id = createId(counterRef);
      const toast: ToastData = {
        id,
        variant: input.variant,
        title: input.title,
        message: input.message,
        durationMs: input.durationMs,
        action: input.action,
      };
      setToasts((current) => [toast, ...current].slice(0, 4));
      return id;
    },
    [setToasts]
  );
  const requestConfirm = useCallback(
    (input: ConfirmInput) => {
      return new Promise<boolean>((resolve) => {
        const id = createId(counterRef);
        setConfirmRequest({
          id,
          variant: input.variant,
          title: input.title,
          message: input.message,
          confirmLabel: input.confirmLabel,
          cancelLabel: input.cancelLabel,
          resolve,
        });
      });
    },
    [setConfirmRequest]
  );
  // Proveedor de la API de notificaciones. Usa useMemo para optimizar la creación de la API.
  const api = useMemo<NotificationsApi>(
    () => ({ notify, dismiss, confirm: requestConfirm }),
    [notify, dismiss, requestConfirm]
  );
  // Consume notificaciones flash persistidas al montar.
  useEffect(() => {
    const flash = consumeFlashNotifies();
    if (flash.length === 0) return;
    for (const item of flash) {
      notify(item);
    }
  }, [notify]);
  return (
    <NotificationsContext.Provider value={api}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
      <ConfirmDialog
        open={confirmRequest !== null}
        variant={confirmRequest?.variant ?? "warning"}
        title={confirmRequest?.title ?? ""}
        message={confirmRequest?.message ?? ""}
        confirmLabel={confirmRequest?.confirmLabel}
        cancelLabel={confirmRequest?.cancelLabel}
        onCancel={() => {
          const req = confirmRequest;
          if (!req) return;
          setConfirmRequest(null);
          req.resolve(false);
        }}
        onConfirm={() => {
          const req = confirmRequest;
          if (!req) return;
          setConfirmRequest(null);
          req.resolve(true);
        }}
      />
    </NotificationsContext.Provider>
  );
}
export function useNotifications(): NotificationsApi {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}
