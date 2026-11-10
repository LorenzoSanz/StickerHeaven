import type { BadgeVariant } from "@/components/ui/Badge";

// Devuelve metadatos sobre el estado de un pedido.
export function getOrderStatusMeta(status: string): { label: string; variant: BadgeVariant; step?: number; hint?: string } {
  switch (status) {
    case "PENDING_PAYMENT":
      return { label: "Pendiente de pago", variant: "warning", step: 0, hint: "Completa el pago para procesar tu pedido." };
    case "PAID":
      return { label: "Pagado", variant: "success", step: 1, hint: "Pago confirmado. Preparando el envío." };
    case "SHIPPED":
      return { label: "Enviado", variant: "default", step: 2, hint: "El pedido está en camino." };
    case "DELIVERED":
      return { label: "Entregado", variant: "success", step: 3, hint: "Pedido entregado." };
    case "PAYMENT_FAILED":
      return { label: "Pago fallido", variant: "danger", hint: "El pago no se pudo confirmar." };
    case "CANCELLED":
      return { label: "Cancelado", variant: "danger", hint: "El pedido fue cancelado." };
    default:
      return { label: status, variant: "default" };
  }
}

