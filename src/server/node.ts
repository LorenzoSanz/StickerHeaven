import { serve } from "@hono/node-server";
import { connectMongo, disconnectMongo } from "@/server/connectMongo";
import { createApp } from "@/server/createApp";
import { container } from "@/infrastructure/di/container";
import { InMemoryRateLimiter } from "@/infrastructure/rateLimit/InMemoryRateLimiter";
import { RedisRateLimiter } from "@/infrastructure/rateLimit/RedisRateLimiter";
import type { RateLimiter } from "@/infrastructure/rateLimit/RateLimiter";
import { env } from "@/config/env";

const logger = container.shared.logger();

// Stock is reserved at checkout; an order not paid within this window gives it back.
const UNPAID_ORDER_MAX_AGE_MS = 30 * 60 * 1000;
const UNPAID_ORDER_SWEEP_INTERVAL_MS = 5 * 60 * 1000;

function startUnpaidOrderSweep(): () => void {
  const releaseUnpaidOrders = container.sales.useCases.releaseUnpaidOrders();
  let running = false;
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      const result = await releaseUnpaidOrders.execute(UNPAID_ORDER_MAX_AGE_MS);
      if (result.isFailure) logger.error("Unpaid order sweep failed", { error: result.error?.message });
    } finally {
      running = false;
    }
  }, UNPAID_ORDER_SWEEP_INTERVAL_MS);
  timer.unref?.();
  return () => clearInterval(timer);
}

// Conecta a MongoDB y levanta el servidor Hono
async function main() {
  try {
    await connectMongo(logger);
  } catch (err) {
    // connectMongo ya loguea errores específicos de DNS
    throw err;
  }

  let rateLimiter: RateLimiter = new InMemoryRateLimiter(60_000, 150);
  if (env.REDIS_URL) {
    try {
      const redisLimiter = new RedisRateLimiter(env.REDIS_URL, 60_000, 150);
      await redisLimiter.connect();
      rateLimiter = redisLimiter;
      logger.info("Redis rate limiting enabled");
    } catch (err) {
      logger.warn("Failed to connect to Redis, falling back to in-memory rate limiting", err);
      rateLimiter = new InMemoryRateLimiter(60_000, 150);
    }
  }

  const app = createApp({ rateLimiter });
  const port = Number(env.PORT);

  const server = serve({ fetch: app.fetch, port });
  logger.info(`API server listening on http://localhost:${port}`);
  const stopUnpaidOrderSweep = startUnpaidOrderSweep();

  const shutdown = async () => {
    stopUnpaidOrderSweep();
    server.close();
    await disconnectMongo(logger);
  };
  // Captura señales de interrupción y terminación para cerrar el servidor y desconectar de MongoDB.
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
// Captura cualquier error no manejado y registra el crash con code 1.
main().catch((err) => {
  logger.error("API server crashed", err);
  process.exit(1);
});
