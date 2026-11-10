/**
 * Comparte contratos UI (tipos) entre provider, helpers y componentes sin acoplarlos a módulos cliente.
 * Define tipos mínimos para toasts y confirmaciones.
 */
import { ConfirmVariant } from "@/components/ui/ConfirmDialog";
import { ToastVariant } from "@/components/ui/Toast";

// Tipo para entrada de notificación.
export type NotifyInput = {
  variant: ToastVariant;
  title: string;
  message?: string;
  durationMs?: number;
  action?: { label: string; onClick: () => void };
};

// Tipo para entrada de confirmación.
export type ConfirmInput = {
  variant?: ConfirmVariant;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

