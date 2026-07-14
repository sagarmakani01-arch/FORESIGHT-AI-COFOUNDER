import { RateLimitError } from './errors';
import * as redis from './redis';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

const inMemoryStore = new Map<string, RateLimitEntry>();

function cleanupInMemory(): void {
  const now = Date.now();
  for (const [key, entry] of inMemoryStore.entries()) {
    if (now > entry.resetAt) {
      inMemoryStore.delete(key);
    }
  }
}

setInterval(cleanupInMemory, 60_000);

export class RateLimiter {
  private configs: Record<string, RateLimitConfig> = {
    api: { limit: 100, windowMs: 60_000 },
    ai: { limit: 20, windowMs: 60_000 },
    auth: { limit: 5, windowMs: 60_000 },
  };

  async check(key: string, limit?: number, windowMs?: number): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const config = {
      limit: limit ?? this.configs.api.limit,
      windowMs: windowMs ?? this.configs.api.windowMs,
    };

    const redisKey = `ratelimit:${key}`;
    const now = Date.now();

    const redisValue = await redis.get(redisKey);
    if (redisValue !== null) {
      const entry: RateLimitEntry = JSON.parse(redisValue);
      if (now > entry.resetAt) {
        const newEntry: RateLimitEntry = { count: 1, resetAt: now + config.windowMs };
        await redis.set(redisKey, JSON.stringify(newEntry), Math.ceil(config.windowMs / 1000));
        return { allowed: true, remaining: config.limit - 1, resetAt: newEntry.resetAt };
      }
      if (entry.count >= config.limit) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
      }
      entry.count += 1;
      const ttl = Math.ceil((entry.resetAt - now) / 1000);
      await redis.set(redisKey, JSON.stringify(entry), ttl);
      return { allowed: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
    }

    const entry = inMemoryStore.get(key);
    if (entry && now <= entry.resetAt) {
      if (entry.count >= config.limit) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
      }
      entry.count += 1;
      return { allowed: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
    }

    const newEntry: RateLimitEntry = { count: 1, resetAt: now + config.windowMs };
    inMemoryStore.set(key, newEntry);

    await redis.set(redisKey, JSON.stringify(newEntry), Math.ceil(config.windowMs / 1000));

    return { allowed: true, remaining: config.limit - 1, resetAt: newEntry.resetAt };
  }

  async reset(key: string): Promise<void> {
    inMemoryStore.delete(key);
    await redis.del(`ratelimit:${key}`);
  }

  async enforce(key: string, limit?: number, windowMs?: number): Promise<void> {
    const result = await this.check(key, limit, windowMs);
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      throw new RateLimitError(retryAfter);
    }
  }
}

export const rateLimiter = new RateLimiter();
