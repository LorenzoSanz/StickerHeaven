/**
 * POR QUÉ: El carrito depende de cookies (sesión y/o carrito anónimo) y requiere Server Actions para operar en SSR y revalidar caché.
 * FLUJO (guest): UI → Server Action → /api/cart → Cart module → backend puede emitir Set-Cookie (anonymous cart id) → Next lo propaga.
 * FLUJO (user): UI → Server Action → /api/cart con cookie de sesión → AuthMiddleware setea userId → casos de uso/policies.
 * LÍMITES: Aquí solo validamos input básico (Zod) y delegamos; no hay lógica de negocio.
 */
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { HttpError, serverApiFetch, serverApiRequest } from "@/lib/serverApi";
import type { CartDTO } from "@/modules/Cart/public";
import { cookieConfig } from "@/config/cookieConfig";
import { propagateCookieFromResponse } from "@/lib/propagateSetCookie";
import { readErrorMessage } from "@/lib/readErrorMessage";

const cartItemSchema = z.object({
  stickerId: z.string().min(1, "Sticker inválido."),
  quantity: z.number().int().min(1, "Cantidad inválida."),
});

const stickerIdSchema = cartItemSchema.shape.stickerId;

/**
 * POR QUÉ: La UI necesita una lectura de carrito tolerante a “no autenticado” y “carrito inexistente”.
 * CONTRATO: Devuelve null en 401/404 (sin sesión o sin carrito); no lanza para evitar romper render SSR.
 */
export async function getCartAction(): Promise<CartDTO | null> {
  try {
    return await serverApiFetch<CartDTO>("/api/cart", { method: "GET" });
  } catch (e) {
    if (e instanceof HttpError && (e.status === 401 || e.status === 404)) {
      return null;
    }
    return null;
  }
}

/**
 * POR QUÉ: La cantidad se actualiza como mutación explícita del carrito y debe invalidar el caché de /cart.
 * FLUJO: UI → Server Action → PATCH /api/cart/items/:id → Cart (use case) → revalidatePath(\"/cart\").
 */
export async function updateItemQuantity(stickerId: string, quantity: number) {
  cartItemSchema.parse({ stickerId, quantity });
  await serverApiFetch(`/api/cart/items/${encodeURIComponent(stickerId)}`, {
    method: "PATCH",
    json: { quantity },
  });

  revalidatePath("/cart");
}

/**
 * POR QUÉ: Eliminación de item como mutación; invalidamos el caché de /cart tras persistir en backend.
 */
export async function removeItem(stickerId: string) {
  stickerIdSchema.parse(stickerId);
  await serverApiFetch(`/api/cart/items/${encodeURIComponent(stickerId)}`, {
    method: "DELETE",
  });

  revalidatePath("/cart");
}

export async function addItemToCartAction(
  stickerId: string,
  quantity: number
): Promise<{ error?: string; success?: true }> {
  const validation = cartItemSchema.safeParse({ stickerId, quantity });
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message ?? "Datos inválidos." };
  }
  try {
    const cookieStore = await cookies();
    const res = await serverApiRequest("/api/cart/items", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      json: { stickerId, quantity },
      cache: "no-store",
    });

    propagateCookieFromResponse({
      res,
      cookieStore,
      cookieName: cookieConfig.cart.name,
      options: cookieConfig.cart,
    });
    // POR QUÉ: En guest checkout, el backend puede crear un carrito y devolver un anonymousId vía Set-Cookie.
    // QUÉ: Propagamos esa cookie en la respuesta de Next para que el navegador pueda recuperar el carrito en requests futuros.

    if (!res.ok) {
      throw new HttpError(await readErrorMessage(res), res.status);
    }
  } catch (e) {
    if (e instanceof HttpError) {
      return { error: e.message };
    }
    return { error: e instanceof Error ? e.message : "No se pudo añadir al carrito" };
  }

  revalidatePath("/cart");
  return { success: true };
}

/**
 * POR QUÉ: Vaciar carrito es una mutación; devolvemos {error/success} para UX consistente (toasts) sin romper navegación.
 * EFECTO: Revalida /cart para reflejar el estado persistido en backend.
 */
export async function clearCartAction(): Promise<{ error?: string; success?: true }> {
  try {
    await serverApiFetch("/api/cart", { method: "DELETE" });
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      return { error: "Inicia sesión para gestionar tu carrito." };
    }
    return { error: e instanceof Error ? e.message : "No se pudo vaciar el carrito" };
  }

  revalidatePath("/cart");
  return { success: true };
}
