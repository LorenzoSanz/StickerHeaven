"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "../_components/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { flashNotify } from "@/components/notifications/flashNotify";
import { useNotifications } from "@/components/notifications/NotificationsProvider";
import { registerAction } from "./actions";

// Página de registro con formulario y enlace a inicio de sesión.
export default function RegisterPage() {
  const router = useRouter();
  const notifications = useNotifications();
  const [state, action, isPending] = useActionState(registerAction, null);
  const lastToastRef = useRef<string | null>(null);

  useEffect(() => {
    if (!state?.error) return;
    if (lastToastRef.current === state.error) return;
    lastToastRef.current = state.error;
    notifications.notify({ variant: "danger", title: "No se pudo crear la cuenta", message: state.error });
  }, [notifications, state?.error]);

  useEffect(() => {
    if (!state?.success) return;
    if (lastToastRef.current === "register_success") return;
    lastToastRef.current = "register_success";
    flashNotify({ variant: "success", title: "Cuenta creada", message: "Sesión iniciada." });
    router.push("/");
  }, [router, state?.success]);

  return (
    <AuthLayout
      title="Crea tu cuenta"
      description="Únete a StickerHeaven para comprar y vender stickers."
      footer={
        <span>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-white hover:text-white/90">
            Inicia sesión
          </Link>
        </span>
      }
    >
      <form action={action} className="space-y-4">
        {state?.error && <Alert variant="danger">{state.error}</Alert>}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-white/80">
            Nombre
          </label>
          <Input id="name" name="name" type="text" required placeholder="Tu nombre" />
        </div>

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
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
          <p className="text-xs text-white/50">Al menos 8 caracteres.</p>
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>
    </AuthLayout>
  );
}
