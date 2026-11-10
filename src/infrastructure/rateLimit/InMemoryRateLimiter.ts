import { RateLimiter, RateLimitDecision } from "./RateLimiter";

export class InMemoryRateLimiter implements RateLimiter {
  private requestCounts = new Map<string, { count: number; resetAt: number }>();
  private lastCleanupAt = 0;

  constructor(
    private readonly windowMs: number,
    private readonly maxRequests: number
  ) {}

  async consume(key: string): Promise<RateLimitDecision> {
    const now = Date.now();

    if (now - this.lastCleanupAt > this.windowMs) {
      this.lastCleanupAt = now;
      for (const [k, record] of this.requestCounts) {
        if (now > record.resetAt) this.requestCounts.delete(k);
      }
    }

    const record = this.requestCounts.get(key);
    if (!record || now > record.resetAt) {
      this.requestCounts.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true };
    }

    if (record.count >= this.maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
      return { allowed: false, retryAfterSeconds };
    }

    record.count += 1;
    this.requestCounts.set(key, record);
    return { allowed: true };
  }
}

