"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useNotifications } from "@/components/notifications/NotificationsProvider";

// Componente para mostrar toasts basados en query params.
export function StickersQueryToasts() {
  const { notify } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const updated = searchParams.get("updated");
    if (!updated) return;

    notify({ variant: "success", title: "Sticker actualizado", message: "Cambios guardados correctamente." });

    const next = new URLSearchParams(searchParams);
    next.delete("updated");
    const suffix = next.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname);
  }, [notify, pathname, router, searchParams]);

  return null;
}

