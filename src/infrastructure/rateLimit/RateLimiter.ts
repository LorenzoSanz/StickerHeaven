export type RateLimitDecision = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

export interface RateLimiter {
  consume(key: string): Promise<RateLimitDecision>;
}

