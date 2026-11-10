# ADR 0001 — Modular monolith with enforced module boundaries

- Status: accepted

## Context

StickerHeaven has five areas with their own rules and vocabulary: identity
(users, sessions), catalog (stickers, stock), cart, sales (orders, payments)
and marketing (newsletter). They change at different speeds and some of them
(sales, catalog) would be the first candidates to scale or split if the shop
grew.

A single developer builds and runs it. Microservices would add network calls,
distributed transactions around stock and payment, and several deployments,
with none of the team-scaling benefits they exist for.

## Decision

One deployable API, split into modules under `src/modules/<Module>`, each with
the same layers:

- `domain`: entities, value objects and repository interfaces, no framework code.
- `application`: one use case per folder, returning `Result` instead of throwing.
- `infrastructure`: Mongoose repositories, Stripe and Cloudinary gateways, HTTP routes.

Modules only talk to each other through ports declared in `src/shared/contracts`
and implemented by adapters in `src/infrastructure/adapters`. Order paid is a
domain event: Sales publishes it and in-process subscribers react (confirmation
email, clearing the cart).

The boundaries are checked, not just agreed on:

- `tests/architecture/noCrossModuleImports.test.ts` fails if a module imports
  another module's internals instead of its `public.ts`.
- `tests/architecture/noInfraAdaptersDirectModuleImports.test.ts` keeps adapters
  on the public API too.
- `bun run depcruise` (dependency-cruiser) checks layer direction.

## Consequences

- One process, one database transaction scope, one deploy: simple to run.
- Extracting a module later means replacing an adapter with a network client;
  the use cases do not change.
- The indirection has a cost: a cross-module call goes port → adapter → public
  API. For five modules this is acceptable; it is the main thing to simplify if
  the boundaries turn out to be wrong.
