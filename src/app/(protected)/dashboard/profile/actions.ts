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
