"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { HttpError, serverApiFetch } from "@/lib/serverApi";

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
