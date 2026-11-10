/**
 * POR QUÉ: El rate limiting es transversal y debe aplicarse de forma uniforme a toda la API, independientemente del módulo.
 * QUÉ: Factory de middleware Hono que consulta un `RateLimiter` (Redis o in-memory) y responde 429 con Retry-After cuando corresponde.
 * LÍMITES: No decide la estrategia de clave (IP/cookie/UA); eso se inyecta vía `getKey` desde el entrypoint (createApp).
 * OBSERVABILIDAD: Usa el header estándar `retry-after` para facilitar backoff del cliente.
 */
import type { MiddlewareHandler } from "hono";
import { HttpStatus } from "@/shared/infrastructure/http/HttpStatus";
import type { RateLimiter } from "./RateLimiter";

/**
 * POR QUÉ: Se quiere desacoplar el “cómo limitar” (RateLimiter) del “dónde aplicarlo” (Hono middleware).
 * QUÉ: Crea un middleware que consume 1 token por request para la clave calculada y retorna 429 cuando se excede el cupo.
 * OBSERVABILIDAD: Cuando el RateLimiter lo provee, añade `retry-after` para que el cliente pueda reintentar con backoff.
 */


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
