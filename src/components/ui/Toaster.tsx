/**
 * Ubicación única para renderizar toasts y evitar duplicación de layouts por página.
 * Contenedor fijo que apila toasts con layout responsive.
 */
"use client";

import { Toast, ToastData } from "@/components/ui/Toast";

export function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:inset-x-auto sm:top-6 sm:right-6 sm:justify-end">
      <div className="pointer-events-none flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}
