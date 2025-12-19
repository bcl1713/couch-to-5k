# Deployment Guide

Instructions for deploying the Couch to 5K application to production
using Docker and Portainer.

## Prerequisites

- Docker installed on your deployment server
- Portainer installed and accessible (optional, for UI management)
- GitHub account and repository access (to pull Docker images)
- Basic knowledge of Docker and port management

## Building the Docker Image

### Step 1: Build Locally (Development)

```bash
npm run docker:build
```

This creates a Docker image called `couch-to-5k:latest` with:

- Node.js 20 Alpine Linux base (minimal size ~150MB)
- Multi-stage build (dependencies + application)
- Non-root user for security
- Dumb-init for proper signal handling
- Standalone Next.js output

### Step 2: Test Locally

```bash
npm run docker:run
```

Verify the app is accessible at [http://localhost:3000](http://localhost:3000)

## Deployment Options

### Option 1: Portainer (Recommended for Self-Hosted)

#### Prerequisites

- Portainer installed on your server
- Docker daemon running and accessible by Portainer
- Port 3000 available on your server

#### Steps

1. Build and tag the image:

```bash
docker build -t couch-to-5k:v1.0.0 .
```

2. Optional: Push to Docker Hub or private registry:

```bash
docker tag couch-to-5k:v1.0.0 yourusername/couch-to-5k:v1.0.0
docker push yourusername/couch-to-5k:v1.0.0
```

3. In Portainer UI:
   1. Navigate to Containers → Create Container
   2. Enter container name: `couch-to-5k`
   3. Image: `couch-to-5k:v1.0.0` (or registry URL)
   4. Port mapping:
      - Container port: `3000`
      - Host port: `3000` (or your desired port)
   5. Environment variables (add):
      - `NODE_ENV=production`
      - `NEXTAUTH_SECRET=your-secret-key-here`
      - `NEXTAUTH_URL=http://your-server-ip:3000`
   6. Optional: Add restart policy (Always)
   7. Deploy

4. Verify container is running and app is accessible

#### Updating the Application

1. Build new image with updated tag:

```bash
docker build -t couch-to-5k:v1.0.1 .
```

2. In Portainer:
   1. Stop current container
   2. Remove old image
   3. Create new container with new image tag
   4. Start new container

### Option 2: Docker CLI (Command Line)

#### Initial Deployment

```bash
# Build image
docker build -t couch-to-5k:v1.0.0 .

# Run container
docker run -d \
  --name couch-to-5k \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXTAUTH_SECRET=your-secret-key \
  -e NEXTAUTH_URL=http://your-server:3000 \
  --restart=always \
  couch-to-5k:v1.0.0
```

#### Useful Commands

```bash
# View running containers
docker ps

# View container logs
docker logs couch-to-5k

# Stop container
docker stop couch-to-5k

# Start container
docker start couch-to-5k

# Remove container
docker rm couch-to-5k

# Update application
docker stop couch-to-5k
docker rm couch-to-5k
docker build -t couch-to-5k:v1.0.1 .
docker run -d \
  --name couch-to-5k \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXTAUTH_SECRET=your-secret-key \
  --restart=always \
  couch-to-5k:v1.0.1
```

### Option 3: Docker Compose (Recommended)

The application includes a `docker-compose.yml` file that orchestrates the app and ensures data persistence using a Docker volume.

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: couch-to-5k:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/app/data/app.db
    volumes:
      - couch-to-5k-data:/app/data

volumes:
  couch-to-5k-data:
```

#### Commands

```bash
# Start the application in the background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop and remove containers
docker-compose down
```

#### Data Persistence

The database is stored in a Docker volume named `couch-to-5k-data`. This ensures that your user data and workout progress are preserved even if the container is removed or updated. The database file is located at `/app/data/app.db` inside the container.

## Environment Configuration

### Required Environment Variables

- `NODE_ENV=production` - Production mode
- `NEXTAUTH_SECRET` - Secret key for authentication (generate strong key)
- `NEXTAUTH_URL` - Public URL of application

### Optional Variables

- `NEXT_PUBLIC_APP_NAME` - Application display name
- `NEXT_PUBLIC_API_URL` - API endpoint URL
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Enable analytics (false for MVP)

### Generating NEXTAUTH_SECRET

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Networking and Ports

### Port Mapping

The application runs on port `3000` inside the container. Map it to
any port on your server:

```bash
# Map container port 3000 to host port 3000
-p 3000:3000

# Map container port 3000 to host port 8080
-p 8080:3000

# Map container port 3000 to host port 80 (requires root/sudo)
-p 80:3000
```

### Reverse Proxy (HTTPS)

For production HTTPS, use a reverse proxy like Nginx:

```nginx
upstream couch-to-5k {
    server localhost:3000;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://couch-to-5k;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Performance Tuning

### Docker Memory and CPU Limits

```bash
docker run -d \
  --name couch-to-5k \
  -p 3000:3000 \
  --memory=512m \
  --cpus=1 \
  couch-to-5k:v1.0.0
```

### Image Size Optimization

Current image size: ~150MB

Factors:

- Node.js Alpine Linux: ~160MB
- Application code: ~10MB
- Dependencies: Included in image

## Monitoring and Logs

### View Logs

```bash
# Last 100 lines
docker logs couch-to-5k

# Follow logs in real-time
docker logs -f couch-to-5k

# Logs from last 10 minutes
docker logs couch-to-5k --since 10m
```

### Health Checks

The application runs on port 3000. Verify it's running:

```bash
# Direct port check
curl http://localhost:3000

# From outside the container
curl http://your-server:3000
```

## Backup and Recovery

### Backup Application

```bash
# Save Docker image
docker save couch-to-5k:v1.0.0 -o couch-to-5k-backup.tar

# Compress backup
gzip couch-to-5k-backup.tar
```

### Restore from Backup

```bash
# Decompress
gunzip couch-to-5k-backup.tar.gz

# Load image
docker load -i couch-to-5k-backup.tar

# Run container
docker run -d -p 3000:3000 couch-to-5k:v1.0.0
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs couch-to-5k

# Common issues:
# - Port already in use: Change -p mapping
# - Missing environment variables: Add required env vars
# - Insufficient memory: Increase --memory limit
```

### Application crashes after start

```bash
# Check memory usage
docker stats couch-to-5k

# Increase memory if needed
docker stop couch-to-5k
docker rm couch-to-5k
docker run -d --memory=1g -p 3000:3000 couch-to-5k:v1.0.0
```

### Port conflicts

```bash
# Find process on port
lsof -i :3000

# Kill process or change Docker port mapping
docker run -d -p 8080:3000 couch-to-5k:v1.0.0
```

## Security Considerations

### Non-Root User

Docker image runs as non-root user `nextjs` for security.

### Environment Secrets

Never commit secrets to git:

```bash
# ✅ Good: Pass as environment variables
docker run -e NEXTAUTH_SECRET=secure-key couch-to-5k

# ❌ Bad: Hardcoded in Dockerfile
# FROM ...
# ENV NEXTAUTH_SECRET=abc123
```

### HTTPS/SSL

Always use HTTPS in production with valid SSL certificates.

## Scaling (Future)

For multiple instances, consider:

- Kubernetes for orchestration
- Load balancer (Nginx, HAProxy)
- Shared database setup
- Session storage (Redis)

## Additional Resources

- [Docker Documentation](https://docs.docker.com)
- [Portainer Documentation](https://docs.portainer.io)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices)
