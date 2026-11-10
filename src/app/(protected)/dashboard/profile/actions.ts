/**
 * POR QUÉ: Perfil/password requieren sesión; Server Actions permiten validar input, enviar cookies SSR y redirigir en servidor.
 * FLUJO: UI → Server Action → /api/auth/profile (PUT) o /api/auth/profile/password (PUT) → Identity (use case + policies).
 * LÍMITES: La validación aquí es de formato/UX; la validación y autorización definitiva vive en backend.
 */
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { HttpError, serverApiFetch } from "@/lib/serverApi";

const profileSchema = z.object({
  username: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

/**
 * POR QUÉ: Actualizar perfil es una mutación; devolvemos {error|success} para feedback sin recargar la página.
 * EFECTO: En 401 redirige a /login (sesión expirada o inexistente).
 */
export async function updateProfile(prevState: unknown, formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;

  const validation = profileSchema.safeParse({ username, email });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  try {
    await serverApiFetch("/api/auth/profile", {
      method: "PUT",
      json: { username, email },
    });
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      redirect("/login");
    }
    return { error: e instanceof Error ? e.message : "No se pudo actualizar el perfil" };
  }
  
  revalidatePath("/dashboard/profile");
  return { success: "Perfil actualizado correctamente" };
}

/**
 * POR QUÉ: Cambiar contraseña requiere conocer el password actual; la UI solo valida formato y delega.
 * EFECTO: En 401 redirige a /login; en éxito retorna mensaje para toasts/UI.
 */
export async function changePassword(prevState: unknown, formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  const validation = passwordSchema.safeParse({ currentPassword, newPassword });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  try {
    await serverApiFetch("/api/auth/profile/password", {
      method: "PUT",
      json: { currentPassword, newPassword },
    });
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      redirect("/login");
    }
    return { error: e instanceof Error ? e.message : "No se pudo cambiar la contraseña" };
  }

  return { success: "Contraseña cambiada correctamente" };
}
