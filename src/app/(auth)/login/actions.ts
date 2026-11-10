"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { cookieConfig } from "@/config/cookieConfig";
import { propagateCookieFromResponse } from "@/lib/propagateSetCookie";
import { serverApiRequest } from "@/lib/serverApi";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export async function loginAction(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string; success?: true }> {
  const payload = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const validation = loginSchema.safeParse(payload);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const cookieStore = await cookies();
  const res = await serverApiRequest("/api/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    json: validation.data,
    cache: "no-store",
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return { error: data?.error || `No se pudo iniciar sesión (${res.status})` };
  }

  const didSetSessionCookie = propagateCookieFromResponse({
    res,
    cookieStore,
    cookieName: cookieConfig.session.name,
    options: cookieConfig.session,
  });

  if (!didSetSessionCookie) {
    return { error: "No se pudo establecer la sesión. Inténtalo de nuevo." };
  }

  return { success: true };
}
