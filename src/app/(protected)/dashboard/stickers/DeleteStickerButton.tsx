"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteSticker } from "./actions";
import { Button } from "@/components/ui/Button";
import { useNotifications } from "@/components/notifications/NotificationsProvider";

// Botón para eliminar un sticker.
export function DeleteStickerButton({ stickerId }: { stickerId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const notifications = useNotifications();

  const onClick = async () => {
    const ok = await notifications.confirm({
      variant: "danger",
      title: "Eliminar sticker",
      message: "¿Eliminar este sticker? Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
    });
    if (!ok) return;

    setIsPending(true);
    try {
      const result = await deleteSticker(stickerId);
      if (result.error) {
        notifications.notify({ variant: "danger", title: "No se pudo eliminar", message: result.error });
        return;
      }
      notifications.notify({ variant: "success", title: "Sticker eliminado", message: "Se eliminó correctamente." });
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={isPending}
      variant="danger"
      size="sm"
    >
      {isPending ? "Eliminando…" : "Eliminar"}
    </Button>
  );
}
