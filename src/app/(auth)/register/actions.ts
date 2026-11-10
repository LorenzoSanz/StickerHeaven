/**
 * POR QUÉ: Unificamos feedback (success/error) vía Server Actions para mostrar toasts consistentes sin lógica de negocio en UI.
 * FLUJO: UI → Server Action → POST /api/auth/register → Identity (RegisterUser + crear sesión) → Next setea cookie de sesión.
 * QUÉ: Valida formato, delega registro al backend y establece cookie HttpOnly en el navegador con el sessionId devuelto.
 */
"use server";

import { z } from "zod";
import { serverApiRequest } from "@/lib/serverApi";
import { cookies } from "next/headers";
import { setSessionCookie } from "@/config/sessionCookie";
import { MIN_PASSWORD_LENGTH } from "@/modules/Identity/public";

const registerSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`),
});

/**
 * POR QUÉ: En App Router, la forma más fiable de establecer cookie de sesión es hacerlo en el servidor de Next.
 * CONTRATO: Devuelve {success} o {error}; no redirige (la pantalla decide el siguiente paso).
 */
export async function registerAction(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string; success?: true }> {
  const payload = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const validation = registerSchema.safeParse(payload);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const res = await serverApiRequest("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    json: validation.data,
    includeCookies: false,
    cache: "no-store",
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return { error: data?.error || `No se pudo registrar (${res.status})` };
  }

  const data = (await res.json().catch(() => null)) as { sessionId?: string } | null;
  const sessionId = data?.sessionId;
  if (!sessionId) {
    return { error: "El registro se completó, pero no se pudo crear la sesión" };
  }

  const cookieStore = await cookies();
  // POR QUÉ: La cookie es HttpOnly; el cliente no puede leerla, así que la emitimos desde Next usando el config centralizado.
  setSessionCookie(
    {
      set: (name, value, opts) => cookieStore.set(name, value, opts as any),
    },
    sessionId
  );

  return { success: true };
}
