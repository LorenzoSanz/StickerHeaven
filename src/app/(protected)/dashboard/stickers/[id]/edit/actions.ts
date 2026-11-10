"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readErrorMessage } from "@/lib/readErrorMessage";
import { HttpError, serverApiFetch, serverApiRequest } from "@/lib/serverApi";

const updateStickerSchema = z.object({
  stickerId: z.string().min(1),
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  priceAmount: z.coerce.number().positive("El precio debe ser mayor que 0"),
  priceCurrency: z.string().length(3, "La moneda debe tener 3 caracteres"),
  stock: z.coerce.number().int().nonnegative("El stock debe ser un entero mayor o igual que 0"),
  tags: z.string().optional(),
});

export async function updateSticker(prevState: unknown, formData: FormData) {
  const payload = {
    stickerId: String(formData.get("stickerId") || ""),
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || ""),
    priceAmount: formData.get("priceAmount"),
    priceCurrency: String(formData.get("priceCurrency") || ""),
    stock: formData.get("stock"),
    tags: String(formData.get("tags") || ""),
  };

  const validation = updateStickerSchema.safeParse(payload);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Entrada inválida" };
  }

  const image = formData.get("image");
  const hasImage = image instanceof File && image.size > 0;

  try {
    if (!hasImage) {
      const tags = validation.data.tags
        ? validation.data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined;

      const json = {
        name: validation.data.name,
        description: validation.data.description,
        price: { amount: validation.data.priceAmount, currency: validation.data.priceCurrency },
        stock: validation.data.stock,
        tags: tags && tags.length > 0 ? tags : undefined,
      };

      await serverApiFetch(`/api/stickers/${encodeURIComponent(validation.data.stickerId)}`, {
        method: "PATCH",
        json,
      });
    } else {
      const multipart = new FormData();
      multipart.set("name", validation.data.name);
      multipart.set("description", validation.data.description);
      multipart.set("priceAmount", String(validation.data.priceAmount));
      multipart.set("priceCurrency", validation.data.priceCurrency);
      multipart.set("stock", String(validation.data.stock));
      if (validation.data.tags) multipart.set("tags", validation.data.tags);
      multipart.set("image", image);

      const res = await serverApiRequest(`/api/stickers/${encodeURIComponent(validation.data.stickerId)}`, {
        method: "PATCH",
        headers: { accept: "application/json" },
        body: multipart,
        cache: "no-store",
      });

      if (!res.ok) {
        throw new HttpError(await readErrorMessage(res), res.status);
      }
    }
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      redirect("/login");
    }
    return { error: e instanceof Error ? e.message : "No se pudo actualizar el sticker" };
  }

  revalidatePath("/dashboard/stickers");
  redirect("/dashboard/stickers?updated=1");
}
