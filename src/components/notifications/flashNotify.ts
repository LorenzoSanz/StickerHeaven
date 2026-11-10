/**
 * Algunas acciones navegan a otra ruta (router.push) y necesitan mostrar un toast después del cambio.
 * Persiste toasts en sessionStorage y los consume al montar el provider.
 */
import { NotifyInput } from "@/components/notifications/types";

const STORAGE_KEY = "stickerheaven.flash_toasts.v1";
function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
export function flashNotify(input: NotifyInput) {
  if (typeof window === "undefined") return;
  try {
    const existing = safeJsonParse<NotifyInput[]>(window.sessionStorage.getItem(STORAGE_KEY) ?? "") ?? [];
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, input].slice(-6)));
  } catch {
    return;
  }
}
export function consumeFlashNotifies(): NotifyInput[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = safeJsonParse<NotifyInput[]>(window.sessionStorage.getItem(STORAGE_KEY) ?? "") ?? [];
    window.sessionStorage.removeItem(STORAGE_KEY);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
