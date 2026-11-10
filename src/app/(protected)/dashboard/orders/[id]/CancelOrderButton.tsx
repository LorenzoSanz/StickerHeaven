"use client";

import { useState } from "react";
import { cancelOrder } from "../../actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useNotifications } from "@/components/notifications/NotificationsProvider";

// Botón para cancelar un pedido en estado PENDING_PAYMENT o PENDING.
export function CancelOrderButton({ orderId, status }: { orderId: string, status: string }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const notifications = useNotifications();

  if (status !== "PENDING_PAYMENT" && status !== "PENDING") {
    return null;
  }

  const handleCancel = async () => {
    const ok = await notifications.confirm({
      variant: "danger",
      title: "Cancelar pedido",
      message: "¿Seguro que quieres cancelar este pedido? Esta acción no se puede deshacer.",
      confirmLabel: "Cancelar pedido",
      cancelLabel: "Volver",
    });
    if (!ok) return;

    setIsPending(true);
    try {
      const result = await cancelOrder(orderId);
      if (result.error) {
        notifications.notify({ variant: "danger", title: "No se pudo cancelar", message: result.error });
      } else {
        notifications.notify({ variant: "success", title: "Pedido cancelado", message: "El pedido se canceló correctamente." });
        router.refresh();
      }
    } catch (error) {
      notifications.notify({ variant: "danger", title: "Error inesperado", message: "Inténtalo de nuevo." });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      onClick={handleCancel}
      disabled={isPending}
      variant="danger"
      size="sm"
    >
      {isPending ? "Cancelando…" : "Cancelar pedido"}
    </Button>
  );
}
