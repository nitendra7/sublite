# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB database
- Domain name (optional)
- SSL certificate (for production)

## Environment Setup

1. Copy `.env.example` to `.env`
2. Configure all environment variables
3. Ensure MongoDB is accessible

## Backend Deployment

### Local Development
```bash
cd backend
npm install
npm run dev
```

### Production Build
```bash
cd backend
npm install --production
npm start
```

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start index.js --name "app-backend"
pm2 startup
pm2 save
```

## Frontend Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Set environment variables in Vercel dashboard

### Build for Production
```bash
cd frontend
npm install
npm run build
```

The build output will be in `frontend/dist/`

### Static Hosting
Upload the contents of `frontend/dist/` to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## Database Setup

### MongoDB Atlas (Cloud)
1. Create account at mongodb.com
2. Create new cluster
3. Configure network access
4. Create database user
5. Get connection string
6. Add to `.env` file

### Local MongoDB
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
mongod --dbpath /path/to/data
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)
```bash
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

### Nginx Configuration
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Docker Deployment (Optional)

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
      
  frontend:
    build: ./frontend
    ports:
      - "80:80"
      
  mongodb:
    image: mongo:6
    volumes:
      - mongodb_data:/data/db
      
volumes:
  mongodb_data:
```

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database connection working
- [ ] SSL certificate installed
- [ ] CORS configured correctly
- [ ] API endpoints accessible
- [ ] Frontend can connect to backend
- [ ] Payment gateway configured (if applicable)
- [ ] Email service configured
- [ ] Monitoring and logging setup
- [ ] Backup strategy in place
- [ ] Domain DNS configured
- [ ] Performance testing completed

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

### Health Check Endpoint
Create a health check at `/api/health`:
```javascript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

## Troubleshooting

### Backend not starting
- Check MongoDB connection
- Verify environment variables
- Check port availability
- Review logs

### Frontend not loading
- Verify API URL configuration
- Check CORS settings
- Clear browser cache
- Check build output

### Database connection issues
- Verify MongoDB is running
- Check connection string
- Verify network access (if using cloud)
- Check credentials

## Backup Strategy

### Automated Backups
```bash
# MongoDB backup script
mongodump --uri="mongodb://connection-string" --out=/backups/$(date +%Y%m%d)

# Schedule with cron
0 2 * * * /path/to/backup-script.sh
```

## Rollback Procedure

If deployment fails:
1. Stop new deployment
2. Restore previous version
3. Clear caches
4. Verify functionality
5. Investigate issues
