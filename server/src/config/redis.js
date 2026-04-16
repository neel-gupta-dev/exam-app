import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient = null;
let isRedisReady = false;

/**
 * Initializes the Redis connection.
 * Gracefully degrades — the app works without Redis (falls back to Mongo).
 */
export const connectRedis = async () => {
  try {
    redisClient = createClient({ url: REDIS_URL });

    redisClient.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
      isRedisReady = false;
    });

    redisClient.on('ready', () => {
      console.log(`[Redis] Connected: ${REDIS_URL}`);
      isRedisReady = true;
    });

    redisClient.on('end', () => {
      console.warn('[Redis] Connection closed.');
      isRedisReady = false;
    });

    await redisClient.connect();
  } catch (err) {
    console.warn('[Redis] Failed to connect — running without cache:', err.message);
    redisClient = null;
    isRedisReady = false;
  }
};

/**
 * Returns the Redis client if connected, or null.
 * Every caller must handle the null case (fallback to Mongo).
 */
export const getRedis = () => (isRedisReady ? redisClient : null);

export default { connectRedis, getRedis };
