import { getClientIp } from "./getClientIp";

/**
 * POR QUÉ: Parsear cookies es un patrón común en servidores HTTP.
 * QUÉ: Expone una función para parsear encabezados de cookie en un objeto key-value.
 * LÍMITES: No valida el formato de cookie; asume que el encabezado es correcto.
 */
function parseCookies(cookieHeader: string | null | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const out: Record<string, string> = {};
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const name = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!name) continue;
    out[name] = value;
  }
  return out;
}
/**
 * POR QUÉ: Generar una clave de limitación de tasa única es esencial para prevenir abusos en APIs.
 * QUÉ: Expone una función para generar una clave única basada en la IP, ID de sesión y carrito anónimo.
 * LÍMITES: No valida la existencia de cookies; asume que están presentes si se proporcionan.
 */
export function getRateLimitKey(
  headers: Headers,
  opts: { trustProxy: boolean; sessionCookieName: string; anonymousCartCookieName: string }
): string {
  const ip = getClientIp(headers, opts.trustProxy);
  if (ip && ip !== "unknown") {
    return `ip:${ip}`;
  }

  /**
   * POR QUÉ: Parsear cookies es un patrón común en servidores HTTP.
   * QUÉ: Expone una función para parsear encabezados de cookie en un objeto key-value.
   * LÍMITES: No valida el formato de cookie; asume que el encabezado es correcto.
   */
  const cookies = parseCookies(headers.get("cookie"));
  const sessionId = cookies[opts.sessionCookieName];
  const anonymousCartId = cookies[opts.anonymousCartCookieName];
  const userAgent = headers.get("user-agent") ?? "";

  return `fallback:${sessionId ?? ""}:${anonymousCartId ?? ""}:${userAgent}`;
}

