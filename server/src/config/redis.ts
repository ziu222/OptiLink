import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error('Redis error:', err.message);
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// ── Helper methods ──────────────────────────────────────────────

/**
 * Get a cached value by key, parsed from JSON.
 */
const getCache = async <T = unknown>(key: string): Promise<T | null> => {
  const data = await redis.get(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return data as unknown as T;
  }
};

/**
 * Set a cached value with optional TTL (seconds).
 */
const setCache = async (key: string, value: unknown, ttlSeconds?: number): Promise<void> => {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  if (ttlSeconds) {
    await redis.setex(key, ttlSeconds, serialized);
  } else {
    await redis.set(key, serialized);
  }
};

/**
 * Delete a cached key.
 */
const deleteCache = async (key: string): Promise<void> => {
  await redis.del(key);
};

/**
 * Delete all keys matching a pattern (e.g., "rt:*").
 * Uses SCAN to avoid blocking Redis.
 */
const deleteCachePattern = async (pattern: string): Promise<number> => {
  let cursor = '0';
  let deletedCount = 0;

  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length > 0) {
      await redis.del(...keys);
      deletedCount += keys.length;
    }
  } while (cursor !== '0');

  return deletedCount;
};

const disconnectRedis = async (): Promise<void> => {
  await redis.quit();
  logger.info('Redis connection closed');
};

export { redis, getCache, setCache, deleteCache, deleteCachePattern, disconnectRedis };
