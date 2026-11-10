/**
 * POR QUÉ: La ficha pública de un sticker se puede servir con caché temporal para mejorar rendimiento sin requerir sesión.
 * QUÉ: Obtiene un sticker por id desde la API y, si no existe, devuelve null para que la página renderice 404/estado vacío.
 * LÍMITES: Query pública; no incluye cookies.
 */
"use server";

import type { StickerDTO } from "@/modules/Catalog/public";
import { HttpError, serverApiFetch } from "@/lib/serverApi";

/**
 * POR QUÉ: La página [id] necesita un contrato simple: StickerDTO o null si no existe.
 * NOTAS: `next.revalidate` permite ISR/SSR caching; el control fino de freshness lo decide la UI.
 */
export async function getStickerByIdAction(id: string): Promise<StickerDTO | null> {
  try {
    return await serverApiFetch(`/api/stickers/${encodeURIComponent(id)}`, {
      method: "GET",
      includeCookies: false,
      next: { revalidate: 60 },
    });
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      return null;
    }
    return null;
  }
}
