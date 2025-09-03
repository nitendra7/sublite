// TODO: Replace in-memory cache with Upstash when ready; easily removable by uncommenting Redis imports and removing fallbacks.

let redis = null;
try {
  redis = require('redis');
} catch (error) {
  console.warn('Redis package not available. Using in-memory cache fallback.');
}

const logger = require('./logger');

// In-memory cache fallback when Redis is unavailable
class InMemoryCache {
  constructor() {
    this.cache = new Map();
    this.isConnected = true; // In-memory is always "connected"
  }

  async connect() {
    console.log('Using in-memory cache (Redis not configured)');
    this.isConnected = true;
    return true;
  }

  async disconnect() {
    // In-memory doesn't need disconnection
    this.isConnected = false;
    logger.info('Disconnected from in-memory cache');
  }

  async get(key) {
    if (!this.isConnected) return null;

    try {
      const item = this.cache.get(key);
      if (!item) return null;

      // Check expiry
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('In-memory cache GET error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    if (!this.isConnected) return false;

    try {
      const expiry = Date.now() + (ttl * 1000);
      this.cache.set(key, { value, expiry });
      return true;
    } catch (error) {
      console.error('In-memory cache SET error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) return false;

    try {
      return this.cache.delete(key);
    } catch (error) {
      console.error('In-memory cache DEL error:', error);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected) return false;

    try {
      const item = this.cache.get(key);
      return item && Date.now() <= item.expiry;
    } catch (error) {
      console.error('In-memory cache EXISTS error:', error);
      return false;
    }
  }

  // Cache middleware for Express routes
  cacheMiddleware(ttl = 3600) {
    return async (req, res, next) => {
      if (!this.isConnected) {
        return next();
      }

      const key = `cache:${req.originalUrl}`;

      try {
        // Try to get cached response
        const cachedResponse = await this.get(key);
        if (cachedResponse) {
          logger.info(`Cache hit (in-memory): ${key}`);
          return res.json(cachedResponse);
        }

        // Store original send method
        const originalSend = res.json.bind(res);

        // Override send method to cache response
        res.json = function(data) {
          // Cache the response
          this.cache.set(key, data, ttl).catch(err => {
            logger.error('Failed to cache response (in-memory):', err);
          });

          // Call original send method
          originalSend(data);
        }.bind(res);

        next();
      } catch (error) {
        logger.error('Cache middleware error (in-memory):', error);
        next();
      }
    };
  }

  async cacheUserSession(userId, sessionData, ttl = 3600) {
    const key = `session:${userId}`;
    return this.set(key, sessionData, ttl);
  }

  async getUserSession(userId) {
    const key = `session:${userId}`;
    return this.get(key);
  }

  async deleteUserSession(userId) {
    const key = `session:${userId}`;
    return this.del(key);
  }

  async cacheServices(services, ttl = 1800) {
    const key = 'services:list';
    return this.set(key, services, ttl);
  }

  async getCachedServices() {
    const key = 'services:list';
    return this.get(key);
  }

  async cacheCategories(categories, ttl = 3600) {
    const key = 'categories:list';
    return this.set(key, categories, ttl);
  }

  async getCachedCategories() {
    const key = 'categories:list';
    return this.get(key);
  }

  async cacheAdminStats(stats, ttl = 300) {
    const key = 'admin:stats';
    return this.set(key, stats, ttl);
  }

  async getCachedAdminStats() {
    const key = 'admin:stats';
    return this.get(key);
  }

  async clearAllCache() {
    try {
      if (!this.isConnected) return false;
      this.cache.clear();
      logger.info('All in-memory cache cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear in-memory cache:', error);
      return false;
    }
  }

  async clearCacheByPattern(pattern) {
    try {
      if (!this.isConnected) return false;

      let cleared = 0;
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          cleared++;
        }
      }
      logger.info(`Cleared ${cleared} in-memory cache entries matching pattern: ${pattern}`);
      return true;
    } catch (error) {
      logger.error('Failed to clear in-memory cache by pattern:', error);
      return false;
    }
  }
}

// Redis-based cache class
class RedisCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Skip Redis connection if not available or not configured
      if (!redis || (!process.env.REDIS_HOST && process.env.NODE_ENV === 'production')) {
        logger.warn('Redis not configured or available. Running without cache.');
        this.isConnected = false;
        return;
      }

      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Connected to Redis');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      logger.warn('Running without Redis cache. Application will work with reduced performance.');
      this.isConnected = false;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from Redis');
    }
  }

  async get(key) {
    try {
      if (!this.isConnected) return null;
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      if (!this.isConnected) return false;
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.isConnected) return false;
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected) return false;
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Cache middleware for Express routes
  cacheMiddleware(ttl = 3600) {
    return async (req, res, next) => {
      if (!this.isConnected) {
        return next();
      }

      const key = `cache:${req.originalUrl}`;

      try {
        // Try to get cached response
        const cachedResponse = await this.get(key);
        if (cachedResponse) {
          logger.info(`Cache hit for ${key}`);
          return res.json(cachedResponse);
        }

        // Store original send method
        const originalSend = res.json;

        // Override send method to cache response
        res.json = function(data) {
          // Cache the response
          this.cache.set(key, data, ttl).catch(err => {
            logger.error('Failed to cache response:', err);
          });

          // Call original send method
          originalSend.call(this, data);
        }.bind(res);

        next();
      } catch (error) {
        logger.error('Cache middleware error:', error);
        next();
      }
    };
  }
}

// Choose cache implementation based on availability and configuration
let cache;
const shouldUseRedis = redis && process.env.REDIS_HOST;

if (shouldUseRedis) {
  console.log('Using Redis cache (Redis configured and available)');
  cache = new RedisCache();
} else {
  console.log('Using in-memory cache (Redis not configured or unavailable)');
  cache = new InMemoryCache();
}

module.exports = cache;
