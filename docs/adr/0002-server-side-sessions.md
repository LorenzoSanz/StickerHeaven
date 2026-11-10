# ADR 0002 — Server-side sessions in MongoDB instead of JWT

- Status: accepted

## Context

Users log in to buy and to manage the stickers they sell. The session has to
end reliably on logout and when the password changes, because a stolen
session must stop working at that point.

A stateless JWT cannot be revoked before it expires without adding a deny
list, which brings back server-side state anyway.

## Decision

- A login creates a `Session` document (random id, user id, `expiresAt`) and
  sets its id in an `httpOnly`, `Secure` (in production), `SameSite=Strict`
  cookie.
- Sessions last one hour. A MongoDB TTL index on `expiresAt` deletes expired
  ones, so there is no cleanup job.
- Logout deletes the session. Changing the password deletes every other
  session of the user and keeps the current one.
- Passwords are hashed with Argon2. Logging in with an unknown email still runs
  an Argon2 verification, so response time does not reveal which emails exist.
- Because the cookie is sent automatically, unsafe requests that carry cookies
  are rejected unless `Origin`/`Referer` is on the allow-list
  (`ALLOWED_ORIGINS`), on top of `SameSite=Strict`.

## Consequences

- Revocation is immediate and simple to reason about.
- Every authenticated request reads one session document; with the index on
  the id this is negligible at this scale, and Redis would be the next step.
- No refresh tokens: after an hour the user logs in again. Acceptable for a
  shop; a sliding expiry would be the change if it became annoying.
