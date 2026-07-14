import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redis: Redis | null = null;
let isConnecting = false;

function getRedisClient(): Redis | null {
  if (redis) return redis;
  if (isConnecting) return null;

  try {
    isConnecting = true;
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 10) {
          redis = null;
          return null;
        }
        return Math.min(times * 200, 5000);
      },
      lazyConnect: true,
      enableReadyCheck: true,
      connectTimeout: 5000,
    });

    redis.on('error', () => {
      redis = null;
    });

    redis.on('close', () => {
      redis = null;
    });

    isConnecting = false;
    return redis;
  } catch {
    isConnecting = false;
    redis = null;
    return null;
  }
}

export async function get(key: string): Promise<string | null> {
  const client = getRedisClient();
  if (!client) return null;
  try {
    if (client.status !== 'ready') return null;
    return await client.get(key);
  } catch {
    return null;
  }
}

export async function set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;
  try {
    if (client.status !== 'ready') return false;
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, value);
    } else {
      await client.set(key, value);
    }
    return true;
  } catch {
    return false;
  }
}

export async function del(...keys: string[]): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;
  try {
    if (client.status !== 'ready') return false;
    await client.del(...keys);
    return true;
  } catch {
    return false;
  }
}

export async function invalidate(pattern: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;
  try {
    if (client.status !== 'ready') return false;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return true;
  } catch {
    return false;
  }
}

export async function getJson<T>(key: string): Promise<T | null> {
  const value = await get(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function setJson(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
  return set(key, JSON.stringify(value), ttlSeconds);
}

export async function disconnect(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
