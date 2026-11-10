# ADR 0005 — Per-request CSP nonce instead of 'unsafe-inline'

- Status: accepted

## Context

A Content Security Policy is the main defence against XSS once some markup
gets injected. With `'unsafe-inline'` in `script-src` an injected `<script>`
runs anyway, so the policy protects very little. Next.js renders inline
scripts for hydration, which is why `'unsafe-inline'` is the easy option.

## Decision

`src/proxy.ts` (Next.js middleware) builds the policy for every request with a
fresh random nonce. Next.js adds that nonce to the scripts it renders, and
`'strict-dynamic'` lets scripts loaded by them run, which covers Stripe.js.

- `script-src 'self' 'nonce-…' 'strict-dynamic'`, no `'unsafe-inline'`;
  `'unsafe-eval'` only in development for React Refresh.
- `connect-src` is limited to the same origin and the Stripe API.
- `style-src` keeps `'unsafe-inline'`: Next and Tailwind inject styles at
  runtime, and style injection is a much smaller risk than script injection.

## Consequences

- An injected script without the nonce is blocked by the browser.
- A nonce cannot exist in HTML generated at build time, so pages render per
  request (the root layout opts in with `connection()`); there are no static
  pages apart from `robots.txt` and the sitemap.
- Verified on a production build: every script on `/`, `/stickers` and
  `/login` carries the nonce of its response, and the nonce changes per request.
