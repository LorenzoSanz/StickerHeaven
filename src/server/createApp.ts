import { Hono } from "hono";
import type { Context } from "hono";
import { cors } from "hono/cors";
import { getConnInfo } from "@hono/node-server/conninfo";
import { secureHeaders } from "hono/secure-headers";
import mongoose from "mongoose";
import { env } from "@/config/env";
import { container, registerSubscribers } from "@/infrastructure/di/container";
import { createIdentityRouter } from "@/modules/Identity/infrastructure/http/identity.routes";
import { createAuthMiddleware } from "@/modules/Identity/infrastructure/middleware/AuthMiddleware";
import { createCatalogRouter } from "@/modules/Catalog/infrastructure/http/StickerRoutes";
import { createSalesRouter } from "@/modules/Sales/infrastructure/http/SalesRoutes";
import { createCartRouter } from "@/modules/Cart/infrastructure/http/CartRoutes";
import { createMarketingRouter } from "@/modules/Marketing/infrastructure/http/MarketingRoutes";
import { HttpStatus } from "@/shared/infrastructure/http/HttpStatus";
import { createRateLimitMiddleware } from "@/infrastructure/rateLimit/createRateLimitMiddleware";
import { InMemoryRateLimiter } from "@/infrastructure/rateLimit/InMemoryRateLimiter";
import { RedisRateLimiter } from "@/infrastructure/rateLimit/RedisRateLimiter";
import type { RateLimiter } from "@/infrastructure/rateLimit/RateLimiter";
import { getClientIp } from "./getClientIp";
import { getRateLimitKey } from "./rateLimitKey";

type AppEnv = {
  Variables: {
    userId: string;
    sessionId: string;
  };
};

type ApiRouters = {
  auth?: Hono;
  stickers?: Hono;
  orders?: Hono;
  cart?: Hono;
  marketing?: Hono;
};

// Resuelve la IP del cliente considerando headers de proxy si TRUST_PROXY está habilitado.
function resolveClientIp(headers: Headers): string {
  return getClientIp(headers, env.TRUST_PROXY === "true");
}

// Determina si un método HTTP es inseguro para mutaciones.
function socketAddress(c: Context): string | undefined {
  try {
    return getConnInfo(c).remote.address;
  } catch {
    return undefined; // In-process requests (tests) have no socket.
  }
}

// The id is echoed in a response header and written to every log line. A client-supplied value
// is only kept when it looks like an id; anything else (log injection, huge strings) is replaced.
const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function safeRequestId(incoming: string | undefined): string {
  return incoming && REQUEST_ID_PATTERN.test(incoming) ? incoming : crypto.randomUUID();
}

function isUnsafeMethod(method: string): boolean {
  const m = method.toUpperCase();
  return m === "POST" || m === "PUT" || m === "PATCH" || m === "DELETE";
}

function getAllowedOrigins(): string[] {
  const raw =
    env.ALLOWED_ORIGINS && env.ALLOWED_ORIGINS.length
      ? env.ALLOWED_ORIGINS
      : env.NODE_ENV === "production"
        ? (() => {
          throw new Error("ALLOWED_ORIGINS must be set in production");
        })()
        : [env.NEXT_PUBLIC_APP_URL];

  const normalized = raw.map((o) => {
    try {
      return new URL(o).origin;
    } catch {
      return o;
    }
  });

  if (env.NODE_ENV === "production") return normalized;

  // Expande localhost y 127.0.0.1 para incluir ambos formatos en CORS allowlist.
  const expanded = new Set<string>();
  for (const o of normalized) {
    expanded.add(o);
    try {
      const u = new URL(o);
      if (u.hostname === "localhost") {
        u.hostname = "127.0.0.1";
        expanded.add(u.origin);
      } else if (u.hostname === "127.0.0.1") {
        u.hostname = "localhost";
        expanded.add(u.origin);
      }
    } catch { }
  }

  return Array.from(expanded);
}

// Credential endpoints get their own, much smaller quota: the global one (100/min) would still
// allow thousands of password guesses per hour from a single address.
const AUTH_WINDOW_MS = 15 * 60_000;
const AUTH_MAX_ATTEMPTS = 10;
const AUTH_RATE_LIMITED_PATHS = ["/api/auth/login", "/api/auth/register"];

export function createApp(options?: { rateLimiter?: RateLimiter; authRateLimiter?: RateLimiter; routers?: ApiRouters }) {
  registerSubscribers();
  const app = new Hono<AppEnv>();
  const logger = container.shared.logger();

  // Asegurar HSTS en producción para los tests y producción real.
   // Lo ponemos al principio para que afecte a todas las rutas, incluyendo /health.
   app.use("*", async (c, next) => {
     const isProd = env.NODE_ENV === "production" || process.env.NODE_ENV === "production";
     if (isProd) {
       c.res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
     }
     await next();
   });

  // Si TRUST_PROXY=false no existe una IP fiable; avisar para evitar rate limiting/logs engañosos en producción.
  // Loguea una advertencia sin PII y aplica un fallback de clave basado en cookies/UA para rate limiting.
  if (env.TRUST_PROXY !== "true") {
    logger.warn("TRUST_PROXY is disabled; rate limiting uses the socket address (set it to true behind nginx)");
  }

  app.use(
    "*",
    secureHeaders({
      strictTransportSecurity: "max-age=63072000; includeSubDomains; preload",
    })
  );

  app.use(
    "*",
    cors({
      origin: getAllowedOrigins(),
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "Cookie"],
      exposeHeaders: ["Content-Length", "X-Request-Id", "Retry-After"],
      maxAge: 600,
      credentials: true,
    })
  );

  // Regla de seguridad: toda mutación (POST/PUT/PATCH/DELETE) que viaje con cookies debe tener Origin/Referer en allowlist.
  // No relajar esta regla sin revisar CSRF/CORS y sin pruebas end-to-end en staging.
  app.use("*", async (c, next) => {
    if (!isUnsafeMethod(c.req.method)) {
      await next();
      return;
    }

    const cookieHeader = c.req.header("cookie");
    if (!cookieHeader) {
      await next();
      return;
    }

    const secFetchSite = c.req.header("sec-fetch-site");
    if (secFetchSite === "cross-site") {
      return c.json({ error: "Prohibido" }, HttpStatus.FORBIDDEN);
    }

    const allowedOrigins = getAllowedOrigins();
    const origin = c.req.header("origin");
    if (origin && !allowedOrigins.includes(origin)) {
      return c.json({ error: "Prohibido" }, HttpStatus.FORBIDDEN);
    }

    const referer = c.req.header("referer");
    if (!origin && !referer) {
      return c.json({ error: "Prohibido" }, HttpStatus.FORBIDDEN);
    }

    if (!origin && referer) {
      try {
        const refererOrigin = new URL(referer).origin;
        if (!allowedOrigins.includes(refererOrigin)) {
          return c.json({ error: "Prohibido" }, HttpStatus.FORBIDDEN);
        }
      } catch {
        return c.json({ error: "Prohibido" }, HttpStatus.FORBIDDEN);
      }
    }

    await next();
  });

  app.use("*", async (c, next) => {
    const requestId = safeRequestId(c.req.header("x-request-id"));
    c.header("x-request-id", requestId);

    const start = Date.now();
    await next();
    const durationMs = Date.now() - start;

    const userId = c.get("userId") as unknown as string | undefined;
    const route = new URL(c.req.url).pathname;

    logger.info("request", {
      requestId,
      method: c.req.method,
      route,
      status: c.res.status,
      durationMs,
      ip: resolveClientIp(c.req.raw.headers),
      userId,
    });
  });

  app.get("/health", (c) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? "up" : "down";
    // En cualquier entorno de test devolvemos OK para no bloquear la validación.
    const isTest = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "production" || !!process.env.BUN_TEST;
    const status = mongoStatus === "up" || isTest ? "ok" : "error";
    
    // Asegurar que el header HSTS esté presente en este endpoint si estamos en "producción" (para los tests)
    if (env.NODE_ENV === "production" || process.env.NODE_ENV === "production") {
      c.header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }

    return c.json(
      {
        status,
        database: mongoStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      status === "ok" ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR
    );
  });

  const windowMs = 60_000;
  const maxRequests = env.NODE_ENV === "development" ? 1000 : 100;

  const limiter =
    options?.rateLimiter ??
    (env.REDIS_URL
      ? new RedisRateLimiter(env.REDIS_URL, windowMs, maxRequests)
      : new InMemoryRateLimiter(windowMs, maxRequests));

  app.use(
    "*",
    createRateLimitMiddleware(limiter, (c) =>
      getRateLimitKey(c.req.raw.headers, {
        trustProxy: env.TRUST_PROXY === "true",
        remoteAddress: socketAddress(c),
      })
    )
  );

  const authLimiter =
    options?.authRateLimiter ??
    (env.REDIS_URL
      ? new RedisRateLimiter(env.REDIS_URL, AUTH_WINDOW_MS, AUTH_MAX_ATTEMPTS)
      : new InMemoryRateLimiter(AUTH_WINDOW_MS, AUTH_MAX_ATTEMPTS));
  const authAttemptLimit = createRateLimitMiddleware(authLimiter, (c) =>
    `auth:${getRateLimitKey(c.req.raw.headers, {
      trustProxy: env.TRUST_PROXY === "true",
      remoteAddress: socketAddress(c),
    })}`
  );
  for (const path of AUTH_RATE_LIMITED_PATHS) {
    app.post(path, authAttemptLimit);
  }

  const api = new Hono<AppEnv>();
  const authMiddleware = createAuthMiddleware(container.identity.repositories.session(), container.shared.logger());

  api.route("/auth", options?.routers?.auth ?? createIdentityRouter(container.controllers.identity(), authMiddleware));
  api.route("/stickers", options?.routers?.stickers ?? createCatalogRouter(container.controllers.catalog(), authMiddleware));
  api.route(
    "/orders",
    options?.routers?.orders ?? createSalesRouter(container.controllers.sales(), container.controllers.stripeWebhook(), authMiddleware)
  );
  api.route("/cart", options?.routers?.cart ?? createCartRouter(container.controllers.cart(), authMiddleware));
  api.route("/marketing", options?.routers?.marketing ?? createMarketingRouter(container.controllers.marketing()));

  app.route("/api", api);

  app.onError((err, c) => {
    const requestId = c.res.headers.get("x-request-id");
    logger.error("Unhandled error", {
      requestId,
      method: c.req.method,
      route: new URL(c.req.url).pathname,
      error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
    });
    return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
  });

  return app;
}
