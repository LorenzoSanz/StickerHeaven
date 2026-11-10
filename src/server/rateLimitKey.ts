import { getClientIp } from "./getClientIp";

/**
 * Identifies the client for rate limiting.
 *
 * Behind a trusted proxy the client IP comes from the headers nginx sets (and sanitises).
 * Otherwise it is the socket's remote address, which the client cannot forge. Nothing the
 * client controls freely (cookies, User-Agent) is ever part of the key: rotating them would
 * give an attacker a fresh quota on every request.
 */
export function getRateLimitKey(
  headers: Headers,
  opts: { trustProxy: boolean; remoteAddress?: string }
): string {
  if (opts.trustProxy) {
    const ip = getClientIp(headers, true);
    if (ip !== "unknown") return `ip:${ip}`;
  }
  if (opts.remoteAddress) return `ip:${opts.remoteAddress}`;
  return "ip:unknown";
}
