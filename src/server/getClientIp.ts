/**
 * POR QUÉ: Obtener la IP del cliente basada en encabezados HTTP para rastrear actividad y prevenir abusos.
 * QUÉ: Expone una función para recuperar la IP del cliente basada en encabezados HTTP.
 * LÍMITES: No valida la validez de la IP; asume que los encabezados son correctos.
 */
export function getClientIp(headers: Headers, trustProxy: boolean): string {
  if (!trustProxy) return "unknown";

  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwardedFor = headers.get("x-forwarded-for");
  if (!forwardedFor) return "unknown";
  const first = forwardedFor.split(",")[0]?.trim();
  return first || "unknown";
}

