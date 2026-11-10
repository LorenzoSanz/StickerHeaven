/**
 * POR QUÉ: El dashboard requiere sesión y hace llamadas SSR a la API; centralizamos aquí esas queries/mutaciones para pages/components.
 * FLUJO: UI (protected) → Server Actions → /api/orders|/api/auth/me → Sales/Identity → redirects y revalidatePath.
 * LÍMITES: No hay lógica de negocio; solo adaptación de transporte (Next) y UX (redirect cuando no hay sesión).
 */
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { HttpError, serverApiFetch } from "@/lib/serverApi";
import type { OrderDTO } from "@/modules/Sales/public";

export type OrderApiDTO = OrderDTO;
export type CurrentUserApiDTO = { id: string; name: string; email: string };

function redirectToLogin(returnTo?: string): never {
  // POR QUÉ: Preservamos la intención del usuario para volver a la pantalla protegida tras autenticarse.
  if (returnTo) {
    redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }
  redirect("/login");
}

export async function getCurrentUser(returnTo?: string): Promise<CurrentUserApiDTO> {
  // POR QUÉ: Server Components del dashboard necesitan el usuario actual; si no hay sesión, redirigimos en servidor.
  try {
    const { user } = await serverApiFetch<{ user: CurrentUserApiDTO }>("/api/auth/me", {
      method: "GET",
    });
    return user;
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      redirectToLogin(returnTo);
    }
    throw e;
  }
}

/**
 * POR QUÉ: El listado de pedidos es un read-model; la UI lo consume como Query simple.
 * FLUJO: UI → GET /api/orders → SalesQueryService → array de OrderDTO.
 */
export async function getUserOrders(): Promise<OrderApiDTO[]> {
  try {
    return await serverApiFetch<OrderApiDTO[]>("/api/orders", { method: "GET" });
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      redirectToLogin("/dashboard");
    }
    throw e;
  }
}

/**
 * POR QUÉ: La página /dashboard/orders/[id] necesita “pedido o null” para decidir render/404.
 * CONTRATO: Devuelve null en 404; redirige a login si falta sesión.
 */
export async function getOrderDetails(orderId: string): Promise<OrderApiDTO | null> {
  try {
    return await serverApiFetch<OrderApiDTO>(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: "GET",
    });
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      redirectToLogin(`/dashboard/orders/${orderId}`);
    }
    if (e instanceof HttpError && e.status === 404) {
      return null;
    }
    throw e;
  }
}

/**
 * POR QUÉ: Cancelar pedido es una mutación; devolvemos {error/success} para mostrar feedback sin romper navegación.
 * EFECTO: Revalida /dashboard y el detalle del pedido para reflejar el nuevo estado persistido.
 */
export async function cancelOrder(orderId: string) {
  try {
    await serverApiFetch(`/api/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: "POST",
    });
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      return { error: "No autorizado" };
    }
    return { error: e instanceof Error ? e.message : "No se pudo cancelar el pedido" };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/orders/${orderId}`);
  return { success: true };
}
