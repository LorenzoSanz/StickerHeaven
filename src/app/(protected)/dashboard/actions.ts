"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { HttpError, serverApiFetch } from "@/lib/serverApi";
import type { OrderDTO } from "@/modules/Sales/public";

export type OrderApiDTO = OrderDTO;
export type CurrentUserApiDTO = { id: string; name: string; email: string };

function redirectToLogin(returnTo?: string): never {
  if (returnTo) {
    redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }
  redirect("/login");
}

export async function getCurrentUser(returnTo?: string): Promise<CurrentUserApiDTO> {
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
