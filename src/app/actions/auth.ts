"use server";

import { cookies } from "next/headers";
import { deleteSessionCookie } from "@/config/sessionCookie";
import { serverApiRequest } from "@/lib/serverApi";

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
