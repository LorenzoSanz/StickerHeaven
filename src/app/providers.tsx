/**
 * POR QUÉ: App Router separa server/client; necesitamos un punto único para providers cliente (toasts/modales).
 * QUÉ: Envuelve la app con providers UI sin contaminar el layout server.
 */
"use client";

import { NotificationsProvider } from "@/components/notifications/NotificationsProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <NotificationsProvider>{children}</NotificationsProvider>;
}

