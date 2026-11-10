"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { HttpError, serverApiFetch } from "@/lib/serverApi";

/**
 * POR QUÉ: El borrado se ejecuta como Server Action para poder incluir cookies SSR (sesión) y manejar redirects en el servidor.
 * FLUJO: UI (Dashboard) → Server Action → DELETE /api/stickers/:id → Catalog (controller/use case/policy) → revalidatePath.
 * EFECTO: Si la sesión falta/expira (401), redirige a /login; si tiene éxito, invalida el caché de /dashboard/stickers.
 */
export async function deleteSticker(stickerId: string): Promise<{ error?: string; success?: true }> {
  try {
    await serverApiFetch(`/api/stickers/${encodeURIComponent(stickerId)}`, {
      method: "DELETE",
    });
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      redirect("/login");
    }
    return { error: e instanceof Error ? e.message : "Failed to delete sticker" };
  }

  revalidatePath("/dashboard/stickers");
  return { success: true };
}
