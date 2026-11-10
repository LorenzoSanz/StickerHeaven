/**
 * Feedback inmediato no bloqueante (éxitos/errores) sin interrumpir el flujo del usuario.
 * Toast estilado con variantes por color y botón de cierre.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export type ToastVariant = "info" | "success" | "warning" | "danger";

export type ToastData = {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  durationMs?: number;
  action?: { label: string; onClick: () => void };
};
 // Componente individual de toast. Renderiza un toast con estilo y funcionalidad.
export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: string) => void;
}) {
  const [isLeaving, setIsLeaving] = useState(false);
  const durationMs = toast.durationMs ?? 2600;

  const styles = useMemo(() => {
    const byVariant: Record<ToastVariant, { container: string; icon: React.ReactNode }> = {
      info: {
        container: "border-cyan-500/25 bg-cyan-500/10 text-cyan-50",
        icon: <Info className="h-5 w-5 text-cyan-300" />,
      },
      success: {
        container: "border-green-500/25 bg-green-500/10 text-green-50",
        icon: <CheckCircle2 className="h-5 w-5 text-green-300" />,
      },
      warning: {
        container: "border-yellow-500/25 bg-yellow-500/10 text-yellow-50",
        icon: <AlertCircle className="h-5 w-5 text-yellow-300" />,
      },
      danger: {
        container: "border-red-500/25 bg-red-500/10 text-red-50",
        icon: <AlertCircle className="h-5 w-5 text-red-300" />,
      },
    };
    return byVariant[toast.variant];
  }, [toast.variant]);

  useEffect(() => {
    if (!durationMs || durationMs <= 0) return;
    const t = window.setTimeout(() => {
      setIsLeaving(true);
      window.setTimeout(() => onDismiss(toast.id), 180);
    }, durationMs);
    return () => window.clearTimeout(t);
  }, [durationMs, onDismiss, toast.id]);

  return (
    <div
      className={cn(
        "pointer-events-auto w-full rounded-2xl border px-4 py-3 shadow-[0_0_40px_rgba(0,0,0,0.45)]",
        "backdrop-blur-md",
        styles.container,
        isLeaving ? "animate-toast-out" : "animate-toast-in",
        "motion-reduce:animate-none"
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{styles.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold leading-5 text-foreground">{toast.title}</p>
            <button
              type="button"
              onClick={() => {
                setIsLeaving(true);
                window.setTimeout(() => onDismiss(toast.id), 180);
              }}
              className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {toast.message ? <p className="mt-1 text-sm text-white/80">{toast.message}</p> : null}

          {toast.action ? (
            <div className="mt-3">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-white/90 hover:bg-white/10"
                onClick={() => toast.action?.onClick()}
              >
                {toast.action.label}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
