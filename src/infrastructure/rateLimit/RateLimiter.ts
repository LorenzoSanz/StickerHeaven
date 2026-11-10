// PROPÓSITO: Define la decisión de limitación de tasa para una clave.
export type RateLimitDecision = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

export interface RateLimiter {
  consume(key: string): Promise<RateLimitDecision>;
}

