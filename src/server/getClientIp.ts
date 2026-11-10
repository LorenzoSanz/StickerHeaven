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

