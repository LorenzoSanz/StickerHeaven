import type { Context, MiddlewareHandler } from "hono";
import { HttpStatus } from "@/shared/infrastructure/http/HttpStatus";
import type { RateLimiter } from "./RateLimiter";

export function createRateLimitMiddleware(
  limiter: RateLimiter,
  getKey: (c: Context) => string
): MiddlewareHandler {
  return async (c, next) => {
    const key = getKey(c);
    const decision = await limiter.consume(key);

    if (!decision.allowed) {
      if (decision.retryAfterSeconds) {
        c.header("retry-after", String(decision.retryAfterSeconds));
      }
      return c.json({ error: "Too many requests" }, HttpStatus.TOO_MANY_REQUESTS);
    }

    await next();
  };
}
