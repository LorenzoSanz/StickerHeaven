"use server";

import type { StickerDTO } from "@/modules/Catalog/public";
import { HttpError, serverApiFetch } from "@/lib/serverApi";

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
