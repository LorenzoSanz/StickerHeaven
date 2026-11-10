import { getClientIp } from "./getClientIp";

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
export function getRateLimitKey(
  headers: Headers,
  opts: { trustProxy: boolean; sessionCookieName: string; anonymousCartCookieName: string }
): string {
  const ip = getClientIp(headers, opts.trustProxy);
  if (ip && ip !== "unknown") {
    return `ip:${ip}`;
  }

  const cookies = parseCookies(headers.get("cookie"));
  const sessionId = cookies[opts.sessionCookieName];
  const anonymousCartId = cookies[opts.anonymousCartCookieName];
  const userAgent = headers.get("user-agent") ?? "";

  return `fallback:${sessionId ?? ""}:${anonymousCartId ?? ""}:${userAgent}`;
}

