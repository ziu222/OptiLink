import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true, // Don't auto-connect, we connect explicitly in app.ts
  retryStrategy(times: number) {
    if (times > 5) {
      logger.error('Redis: max retries reached, giving up');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 500, 3000);
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

const connectRedis = async (): Promise<void> => {
  try {
    await redis.connect();
  } catch (error) {
    logger.error('Redis connection failed:', error instanceof Error ? error.message : error);
    logger.warn('Server will continue without Redis — caching disabled');
  }
};

/**
 * Get a cached value by key, parsed from JSON.
 */
const getCache = async <T = unknown>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  } catch {
    return null; // Silently fail if Redis is down
  }
};

/**
 * Set a cached value with optional TTL (seconds).
 */
const setCache = async (key: string, value: unknown, ttlSeconds?: number): Promise<void> => {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch {
    // Silently fail if Redis is down
  }
};

/**
 * Delete a cached key.
 */
const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch {
    // Silently fail
  }
};

/**
 * Delete all keys matching a pattern (e.g., "rt:*").
 * Uses SCAN to avoid blocking Redis.
 */
const deleteCachePattern = async (pattern: string): Promise<number> => {
  try {
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
  } catch {
    return 0;
  }
};

const disconnectRedis = async (): Promise<void> => {
  try {
    await redis.quit();
    logger.info('Redis connection closed');
  } catch {
    // Already disconnected
  }
};

export { redis, connectRedis, getCache, setCache, deleteCache, deleteCachePattern, disconnectRedis };
