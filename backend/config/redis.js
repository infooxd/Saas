import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;

const connectRedis = async () => {
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
        console.error('Redis Client Error:', err);
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
    console.error('❌ Redis connection failed:', error);
    return null;
  }
};

// Cache helper functions
export const cache = {
  async get(key) {
    try {
      if (!redisClient) await connectRedis();
      if (!redisClient) return null;
      
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    try {
      if (!redisClient) await connectRedis();
      if (!redisClient) return false;
      
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  async del(key) {
    try {
      if (!redisClient) await connectRedis();
      if (!redisClient) return false;
      
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  async flush() {
    try {
      if (!redisClient) await connectRedis();
      if (!redisClient) return false;
      
      await redisClient.flushAll();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }
};

export { connectRedis };
export default redisClient;