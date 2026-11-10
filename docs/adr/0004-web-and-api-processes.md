# ADR 0004 — Separate Next.js web and Hono API processes

- Status: accepted

## Context

Next.js can host the API in route handlers, which would mean one process. But
the domain code (modules, Stripe webhooks, the unpaid-order sweep, rate
limiting) then runs inside the web framework's request lifecycle, and the web
process needs every backend secret.

## Decision

Two processes from the same repository:

- **API** (`src/server/node.ts`): Hono on Bun, port 3001. Owns the modules,
  MongoDB, Redis, Stripe and Cloudinary, the webhook and the background sweep.
- **Web** (Next.js, port 3000): renders pages and calls the API. Server
  components call it directly with the user's cookies; the browser reaches it
  same-origin through a `/api/*` rewrite, so no CORS is needed in production.

In production nginx sits in front of both and is the only public entry point.

The web process only validates public configuration (`NEXT_PUBLIC_*`) and never
receives database, Stripe or Cloudinary secrets.

## Consequences

- The API can be tested, scaled and restarted without the web app, and the
  web app holds no secrets.
- Two processes to run in development (`dev:api` and `dev:web`) and two images
  to build.
- Server-rendered pages make an HTTP call to the API instead of a function
  call; on the same host this costs a few milliseconds.
