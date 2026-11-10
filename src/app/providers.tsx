"use client";

import { NotificationsProvider } from "@/components/notifications/NotificationsProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <NotificationsProvider>{children}</NotificationsProvider>;
}

