const redis = require('redis');
const logger = require('./logger');

class Cache {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
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

  // Cache user sessions
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

  // Cache service listings
  async cacheServices(services, ttl = 1800) {
    const key = 'services:list';
    return this.set(key, services, ttl);
  }

  async getCachedServices() {
    const key = 'services:list';
    return this.get(key);
  }

  // Cache categories
  async cacheCategories(categories, ttl = 3600) {
    const key = 'categories:list';
    return this.set(key, categories, ttl);
  }

  async getCachedCategories() {
    const key = 'categories:list';
    return this.get(key);
  }

  // Cache admin stats
  async cacheAdminStats(stats, ttl = 300) {
    const key = 'admin:stats';
    return this.set(key, stats, ttl);
  }

  async getCachedAdminStats() {
    const key = 'admin:stats';
    return this.get(key);
  }

  // Clear all cache
  async clearAllCache() {
    try {
      if (!this.isConnected) return false;
      await this.client.flushAll();
      logger.info('All cache cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear cache:', error);
      return false;
    }
  }

  // Clear cache by pattern
  async clearCacheByPattern(pattern) {
    try {
      if (!this.isConnected) return false;

      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.info(`Cleared ${keys.length} cache entries matching pattern: ${pattern}`);
      }
      return true;
    } catch (error) {
      logger.error('Failed to clear cache by pattern:', error);
      return false;
    }
  }
}

// Create singleton instance
const cache = new Cache();

module.exports = cache;
