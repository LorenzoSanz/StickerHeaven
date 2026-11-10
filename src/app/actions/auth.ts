/**
 * POR QUÉ: Logout desde UI necesita Server Action para devolver {success/error} y permitir toasts consistentes.
 * FLUJO: UI → Server Action → POST /api/auth/logout → Identity → siempre borramos cookie local para cerrar sesión en el navegador.
 * QUÉ: Intenta invalidar la sesión en backend y, en cualquier caso, elimina la cookie de sesión en Next para evitar sesiones “zombies”.
 */
"use server";

import { cookies } from "next/headers";
import { deleteSessionCookie } from "@/config/sessionCookie";
import { serverApiRequest } from "@/lib/serverApi";

/**
 * POR QUÉ: Si el backend falla o la sesión ya no existe, el usuario igualmente espera “quedar deslogueado” en este navegador.
 * EFECTO: Siempre ejecuta `deleteSessionCookie` en el finally para limpiar credenciales locales.
 */
export async function logoutAction(): Promise<{ error?: string; success?: true }> {
  const cookieStore = await cookies();

  try {
    const res = await serverApiRequest("/api/auth/logout", {
      method: "POST",
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok && res.status !== 401) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      return { error: data?.error || `No se pudo cerrar sesión (${res.status})` };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo cerrar sesión" };
  } finally {
    deleteSessionCookie({
      delete: (name) => cookieStore.delete(name),
      set: (name, value, opts) => cookieStore.set(name, value, opts),
    });
  }

  return { success: true };
}
