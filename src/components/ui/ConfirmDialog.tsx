/**
 * Las acciones destructivas requieren confirmación consistente (no usar diálogos nativos del navegador).
 * Dialog reusable con código de color, botones claros y accesibilidad básica.
 */
"use client";

import { useId } from "react";
import { AlertTriangle, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export type ConfirmVariant = "info" | "warning" | "danger";

export type ConfirmDialogProps = {
  open: boolean;
  variant?: ConfirmVariant;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Componente para mostrar un diálogo de confirmación con diferentes variantes y estilos.
export function ConfirmDialog({
  open,
  variant = "warning",
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  const accent: Record<ConfirmVariant, string> = {
    info: "border-cyan-500/25 ring-cyan-500/15",
    warning: "border-yellow-500/25 ring-yellow-500/15",
    danger: "border-red-500/25 ring-red-500/15",
  };

  const icon = (() => {
    if (variant === "danger") return <Trash2 className="h-5 w-5 text-red-300" />;
    if (variant === "warning") return <AlertTriangle className="h-5 w-5 text-yellow-300" />;
    return <Info className="h-5 w-5 text-cyan-300" />;
  })();

  const confirmButtonVariant = variant === "danger" ? "danger" : "primary";

  return (
    <Modal open={open} onClose={onCancel} titleId={titleId} descriptionId={descriptionId} size="sm">
      <div className={cn("rounded-2xl border bg-surface/95", accent[variant])}>
        <div className="flex items-start gap-3 px-6 pt-6">
          <div className="mt-0.5 rounded-lg border border-white/10 bg-white/5 p-2">{icon}</div>
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-white/70">
              {message}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 px-6 pb-6 pt-5 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isConfirming}>
            {cancelLabel}
          </Button>
          <Button variant={confirmButtonVariant} onClick={onConfirm} disabled={isConfirming}>
            {isConfirming ? "Procesando…" : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
