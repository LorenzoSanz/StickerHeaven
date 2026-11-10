"use client";

import { useEffect } from "react";
import { useNotifications } from "@/components/notifications/NotificationsProvider";

const SEEN_KEY = "stickerheaven.checkout_success_toast.v1";

export function SuccessToasts() {
  const notifications = useNotifications();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SEEN_KEY) === "1") return;
    window.sessionStorage.setItem(SEEN_KEY, "1");
    notifications.notify({
      variant: "success",
      title: "Pago confirmado",
      message: "Gracias por tu compra. Tu pedido está siendo procesado.",
    });
  }, [notifications]);

  return null;
}

