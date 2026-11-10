/**
 * PROPÓSITO: Unidad del proyecto con responsabilidad acotada por su ubicación y nombre.
 * RESPONSABILIDAD: Código de soporte del proyecto.
 * DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 * NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.
 */
"use client";

// POR QUÉ: React 19 renombró useFormState a useActionState; mantiene el mismo flujo de forms sin warnings en consola.
import { useActionState } from "react";
import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile, changePassword } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useNotifications } from "@/components/notifications/NotificationsProvider";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando…" : label}
    </Button>
  );
}
// Formulario para actualizar nombre y email del usuario.
export default function ProfilePage({ user }: { user: { name: string; email: string } }) {
  const notifications = useNotifications();
  const [profileState, profileAction] = useActionState(updateProfile, null);
  const [passwordState, passwordAction] = useActionState(changePassword, null);
  const lastToastRef = useRef<Record<string, string | null>>({
    profile: null,
    password: null,
  });

  useEffect(() => {
    const key = profileState?.error ? `e:${profileState.error}` : profileState?.success ? `s:${profileState.success}` : null;
    if (!key) return;
    if (lastToastRef.current.profile === key) return;
    lastToastRef.current.profile = key;
    if (profileState?.error) {
      notifications.notify({ variant: "danger", title: "No se pudo actualizar el perfil", message: profileState.error });
      return;
    }
    if (profileState?.success) {
      notifications.notify({ variant: "success", title: "Perfil actualizado", message: profileState.success });
    }
  }, [notifications, profileState?.error, profileState?.success]);

  useEffect(() => {
    const key = passwordState?.error ? `e:${passwordState.error}` : passwordState?.success ? `s:${passwordState.success}` : null;
    if (!key) return;
    if (lastToastRef.current.password === key) return;
    lastToastRef.current.password = key;
    if (passwordState?.error) {
      notifications.notify({ variant: "danger", title: "No se pudo cambiar la contraseña", message: passwordState.error });
      return;
    }
    if (passwordState?.success) {
      notifications.notify({ variant: "success", title: "Contraseña actualizada", message: passwordState.success });
    }
  }, [notifications, passwordState?.error, passwordState?.success]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
        </CardHeader>
        <CardContent>
          {profileState?.error && <Alert variant="danger">{profileState.error}</Alert>}
          {profileState?.success && <Alert variant="success">{profileState.success}</Alert>}

          <form action={profileAction} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="profile-username" className="block text-sm font-medium text-white/80">
                Nombre
              </label>
              <Input id="profile-username" name="username" type="text" required minLength={2} defaultValue={user?.name} autoComplete="name" />
            </div>
            <div className="space-y-2">
              <label htmlFor="profile-email" className="block text-sm font-medium text-white/80">
                Email
              </label>
              <Input id="profile-email" name="email" type="email" required defaultValue={user?.email} autoComplete="email" />
            </div>
            <SubmitButton label="Actualizar perfil" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          {passwordState?.error && <Alert variant="danger">{passwordState.error}</Alert>}
          {passwordState?.success && <Alert variant="success">{passwordState.success}</Alert>}

          <form action={passwordAction} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="current-password" className="block text-sm font-medium text-white/80">
                Contraseña actual
              </label>
              <Input id="current-password" name="currentPassword" type="password" required autoComplete="current-password" />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-password" className="block text-sm font-medium text-white/80">
                Nueva contraseña
              </label>
              <Input id="new-password" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
            </div>
            <SubmitButton label="Cambiar contraseña" />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
