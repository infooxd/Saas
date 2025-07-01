import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;

const connectRedis = async () => {
  // Skip Redis in development if not configured
  if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL) {
    console.log('⚠️ Redis not configured for development - using memory cache fallback');
    return null;
  }

  try {
    if (!redisClient) {
      redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('Redis connection refused');
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err.message);
      });

      redisClient.on('connect', () => {
        console.log('✅ Connected to Redis');
      });

      redisClient.on('ready', () => {
        console.log('✅ Redis client ready');
      });

      redisClient.on('end', () => {
        console.log('❌ Redis connection ended');
      });

      await redisClient.connect();
    }
    
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.log('⚠️ Continuing without Redis cache');
    return null;
  }
};

// In-memory cache fallback for development
const memoryCache = new Map();

// Cache helper functions with fallback
export const cache = {
  async get(key) {
    try {
      if (redisClient) {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Use memory cache fallback
        const cached = memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.value;
        }
        memoryCache.delete(key);
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    try {
      if (redisClient) {
        await redisClient.setEx(key, ttl, JSON.stringify(value));
        return true;
      } else {
        // Use memory cache fallback
        memoryCache.set(key, {
          value,
          expiry: Date.now() + (ttl * 1000)
        });
        return true;
      }
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  },

  async del(key) {
    try {
      if (redisClient) {
        await redisClient.del(key);
        return true;
      } else {
        // Use memory cache fallback
        memoryCache.delete(key);
        return true;
      }
    } catch (error) {
      console.error('Cache delete error:', error.message);
      return false;
    }
  },

  async flush() {
    try {
      if (redisClient) {
        await redisClient.flushAll();
        return true;
      } else {
        // Use memory cache fallback
        memoryCache.clear();
        return true;
      }
    } catch (error) {
      console.error('Cache flush error:', error.message);
      return false;
    }
  }
};

export { connectRedis };
export default redisClient;