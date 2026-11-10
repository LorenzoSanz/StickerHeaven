// Server components call the API from the web container. Without the visitor's address every
// page render would reach the API from the same IP and share one rate-limit bucket. nginx sets
// X-Real-IP on the request to the web (overwriting anything the client sent), so it is copied on.
export function forwardClientIp(incoming: Headers, outgoing: Headers): void {
  const clientIp = incoming.get("x-real-ip");
  if (clientIp && !outgoing.has("x-real-ip")) {
    outgoing.set("x-real-ip", clientIp);
  }
}
