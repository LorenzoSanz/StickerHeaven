"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { flashNotify } from "@/components/notifications/flashNotify";
import { useNotifications } from "@/components/notifications/NotificationsProvider";
import { loginAction } from "./actions";

export function LoginForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const notifications = useNotifications();
  const [state, action, isPending] = useActionState(loginAction, null);
  const lastToastRef = useRef<string | null>(null);
  const pendingRefreshPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!state?.error) return;
    if (lastToastRef.current === state.error) return;
    lastToastRef.current = state.error;
    notifications.notify({ variant: "danger", title: "No se pudo iniciar sesión", message: state.error });
  }, [notifications, state?.error]);

  useEffect(() => {
    if (!state?.success) return;
    if (lastToastRef.current === "login_success") return;
    lastToastRef.current = "login_success";
    flashNotify({ variant: "success", title: "Sesión iniciada", message: "Bienvenido de vuelta." });
    const returnTo = searchParams.get("returnTo");
    const destination = returnTo && returnTo.startsWith("/") ? returnTo : "/";
    const destinationPathname = destination.split("?")[0]?.split("#")[0] ?? "/";
    pendingRefreshPathnameRef.current = destinationPathname;
    router.push(destination);
  }, [router, searchParams, state?.success]);

  useEffect(() => {
    const pending = pendingRefreshPathnameRef.current;
    if (!pending) return;
    if (pathname !== pending) return;
    router.refresh();
    pendingRefreshPathnameRef.current = null;
  }, [pathname, router]);

  return (
    <form action={action} className="space-y-4">
      {state?.error && <Alert variant="danger">{state.error}</Alert>}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-white/80">
          Email
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-white/80">
          Contraseña
        </label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Iniciando sesión…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
