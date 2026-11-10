import type { MiddlewareHandler } from "hono";
import { HttpStatus } from "@/shared/infrastructure/http/HttpStatus";
import type { RateLimiter } from "./RateLimiter";

// El resumen de esta función es:
// - Recibe un RateLimiter y una función para obtener la clave de limitación.
// - Devuelve un middleware Hono que consume tokens para la clave y retorna 429 cuando se excede el cupo.
export function createRateLimitMiddleware(
  limiter: RateLimiter,
  getKey: (headers: Headers) => string
): MiddlewareHandler {
  return async (c, next) => {
    const key = getKey(c.req.raw.headers);
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
