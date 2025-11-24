# Performance Optimization Guide

## Overview

This document outlines performance optimization strategies and best practices implemented in the application.

## Frontend Performance

### Code Splitting

Use React lazy loading for route-based code splitting:

```javascript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  );
}
```

### Image Optimization

1. **Use WebP format** with fallbacks
2. **Implement lazy loading** for images
3. **Use responsive images** with srcset
4. **Compress images** before upload
5. **Use CDN** for static assets

```jsx
<img
  src="image.webp"
  srcSet="image-small.webp 400w, image-medium.webp 800w, image-large.webp 1200w"
  loading="lazy"
  alt="Description"
/>
```

### Bundle Optimization

- **Tree shaking**: Remove unused code
- **Minification**: Compress JavaScript and CSS
- **Compression**: Enable Gzip/Brotli compression
- **Caching**: Set proper cache headers

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
};
```

### Performance Monitoring

```javascript
// Measure component render time
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`Component rendered in ${endTime - startTime}ms`);
    };
  }, []);
}
```

## Backend Performance

### Database Optimization

#### Indexing
```javascript
// Create indexes for frequently queried fields
db.collection('bookings').createIndex({ userId: 1, status: 1 });
db.collection('services').createIndex({ category: 1, price: 1 });
db.collection('users').createIndex({ email: 1 }, { unique: true });
```

#### Query Optimization
```javascript
// Use projection to limit fields
const users = await User.find({}, 'name email');

// Use lean() for read-only queries
const services = await Service.find().lean();

// Use limit and skip for pagination
const bookings = await Booking.find()
  .skip((page - 1) * limit)
  .limit(limit);
```

### Caching Strategy

#### Redis Caching
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache frequently accessed data
async function getService(id) {
  const cacheKey = `service:${id}`;
  
  // Check cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const service = await Service.findById(id);
  
  // Store in cache (expire after 1 hour)
  await client.setex(cacheKey, 3600, JSON.stringify(service));
  
  return service;
}
```

#### In-Memory Caching
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });

function getCachedData(key, fetchFunction) {
  const cached = cache.get(key);
  if (cached) return cached;
  
  const data = fetchFunction();
  cache.set(key, data);
  return data;
}
```

### API Optimization

#### Response Compression
```javascript
const compression = require('compression');
app.use(compression());
```

#### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### Connection Pooling
```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000
});
```

### Load Balancing

Use PM2 for clustering:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api',
    script: './index.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

## Performance Metrics

### Key Metrics to Monitor

1. **Time to First Byte (TTFB)**: < 200ms
2. **First Contentful Paint (FCP)**: < 1.8s
3. **Largest Contentful Paint (LCP)**: < 2.5s
4. **Time to Interactive (TTI)**: < 3.8s
5. **Total Blocking Time (TBT)**: < 200ms
6. **Cumulative Layout Shift (CLS)**: < 0.1

### Monitoring Tools

- **Frontend**: Lighthouse, WebPageTest, Chrome DevTools
- **Backend**: New Relic, DataDog, PM2 Monitor
- **Database**: MongoDB Atlas Monitoring, Query Profiler

## Best Practices

### Frontend

1. Minimize HTTP requests
2. Use CDN for static assets
3. Implement virtual scrolling for large lists
4. Debounce/throttle user inputs
5. Use React.memo for expensive components
6. Avoid inline functions in render
7. Optimize re-renders with useMemo/useCallback

### Backend

1. Use asynchronous operations
2. Implement proper error handling
3. Optimize database queries
4. Use connection pooling
5. Implement caching strategies
6. Monitor memory usage
7. Use worker threads for CPU-intensive tasks

### Database

1. Create proper indexes
2. Use aggregation pipelines efficiently
3. Avoid N+1 queries
4. Use bulk operations
5. Implement sharding for large datasets
6. Regular database maintenance
7. Monitor slow queries

## Performance Checklist

- [ ] Enabled Gzip/Brotli compression
- [ ] Implemented code splitting
- [ ] Optimized images (WebP, lazy loading)
- [ ] Set up CDN for static assets
- [ ] Implemented caching (Redis/in-memory)
- [ ] Created database indexes
- [ ] Enabled query optimization
- [ ] Set up connection pooling
- [ ] Implemented rate limiting
- [ ] Configured load balancing
- [ ] Set up monitoring and alerts
- [ ] Optimized bundle size
- [ ] Removed unused dependencies
- [ ] Implemented pagination
- [ ] Optimized API responses
- [ ] Set proper cache headers

## Continuous Optimization

1. Regular performance audits
2. Monitor key metrics
3. Profile application regularly
4. Keep dependencies updated
5. Review and optimize queries
6. A/B test performance improvements
7. Collect user feedback
