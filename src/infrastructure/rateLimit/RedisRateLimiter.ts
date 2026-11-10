// PROPÓSITO: Implementa un RateLimiter usando Redis para limitar el número de solicitudes por clave.
import { createClient, type RedisClientType } from "redis";
import { RateLimiter, RateLimitDecision } from "./RateLimiter";

// Lua es un lenguaje de scripting ligero y embeddable.
// Script Lua para incrementar el contador y establecer la expiración si es la primera vez.
const LUA_INCR_WITH_PEXPIRE = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return current
`;

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class RedisRateLimiter implements RateLimiter {
  private client: RedisClientType;
  private readonly redisUrl: string;

  constructor(
    redisUrl: string,
    private readonly windowMs: number,
    private readonly maxRequests: number
  ) {
    this.redisUrl = redisUrl;
    this.client = this.buildClient();
  }

  // PROPÓSITO: Crea un cliente Redis con configuración básica.
  private buildClient(): RedisClientType {
    return createClient({
      url: this.redisUrl,
      socket: {
        connectTimeout: 5_000,
        reconnectStrategy: (retries) => Math.min(1_000, retries * 50),
        keepAlive: 5_000,
      },
    });
  }

  // PROPÓSITO: Asegura que el cliente Redis está conectado.
  private async ensureConnected(): Promise<void> {
    if (this.client.isReady) return;
    if (!this.client.isOpen) {
      await this.client.connect();
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Redis connection not ready")), 5_000);
      const onReady = () => {
        clearTimeout(timeout);
        cleanup();
        resolve();
      };
      const onError = (e: unknown) => {
        clearTimeout(timeout);
        cleanup();
        reject(e instanceof Error ? e : new Error("Redis connection error"));
      };
      const cleanup = () => {
        this.client.off("ready", onReady);
        this.client.off("error", onError);
      };
      this.client.on("ready", onReady);
      this.client.on("error", onError);
    });
  }

  async connect(): Promise<void> {
    await this.ensureConnected();
    await this.client.ping();
  }

  // PROPÓSITO: Cierra la conexión con Redis.
  async disconnect(): Promise<void> {
    if (!this.client.isOpen) return;
    await this.client.quit();
  }

  // PROPÓSITO: Consume una solicitud para la clave dada y devuelve la decisión de limitación de tasa.
  async consume(key: string): Promise<RateLimitDecision> {
    try {
      await this.ensureConnected();
      const windowId = Math.floor(Date.now() / this.windowMs);
      const redisKey = `rl:${key}:${windowId}`;

      const current = await this.client.eval(LUA_INCR_WITH_PEXPIRE, {
        keys: [redisKey],
        arguments: [String(this.windowMs)],
      });

      const count = typeof current === "number" ? current : Number(current);
      if (Number.isNaN(count)) return { allowed: true };

      if (count > this.maxRequests) {
        const ttlMs = await this.client.pTTL(redisKey);
        const retryAfterSeconds = Math.max(1, Math.ceil(Math.max(0, ttlMs) / 1000));
        return { allowed: false, retryAfterSeconds };
      }

      return { allowed: true };
    } catch {
      try {
        this.client.disconnect();
      } catch {}
      this.client = this.buildClient();
      return { allowed: true };
    }
  }
}
