import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import { HttpError, serverApiFetch } from "@/lib/serverApi";
import { DashboardShell } from "../_components/DashboardShell";

// Página de perfil del usuario con formulario para actualizar nombre y email.
export default async function ProfilePageWrapper() {
  const user = await getUserOrRedirect();
  return (
    <DashboardShell title="Cuenta" description="Actualiza tu perfil y contraseña.">
      <div className="max-w-2xl mx-auto">
        <ProfileForm user={user} />
      </div>
    </DashboardShell>
  );
}
// Obtiene los datos del usuario autenticado o redirige a login si no está autenticado.
async function getUserOrRedirect(): Promise<{ name: string; email: string }> {
  try {
    const { user } = await serverApiFetch<{ user: { name: string; email: string } }>("/api/auth/me", {
      method: "GET",
    });
    return user;
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      redirect("/login");
    }
    throw e;
  }
}
