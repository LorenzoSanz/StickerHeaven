import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import { HttpError, serverApiFetch } from "@/lib/serverApi";
import { DashboardShell } from "../_components/DashboardShell";

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
