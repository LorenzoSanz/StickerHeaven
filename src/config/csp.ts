/**
 * Content Security Policy for the web app, built per request with a fresh nonce.
 *
 * Scripts run only when they carry the nonce Next.js adds to its own tags; 'strict-dynamic'
 * extends that trust to scripts those load (Stripe.js is injected by @stripe/stripe-js).
 * An injected <script> without the nonce is blocked, which 'unsafe-inline' used to allow.
 * Styles keep 'unsafe-inline': Next and Tailwind inject them at runtime and the risk is far lower.
 */
export function buildCsp(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: https:",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://*.js.stripe.com${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // Stripe Elements endpoints, as documented by Stripe; the API is reached same-origin via /api.
    "connect-src 'self' https://api.stripe.com",
    "frame-src https://js.stripe.com https://*.js.stripe.com https://hooks.stripe.com",
  ].join("; ");
}
