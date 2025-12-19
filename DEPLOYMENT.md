# Deployment Guide

Instructions for deploying the Couch to 5K application to production
using Docker and Portainer.

## Prerequisites

- Docker installed on your deployment server
- Portainer installed and accessible (optional, for UI management)
- Docker Hub account (to pull pre-built images)
- Basic knowledge of Docker and port management

## Automated Releases

The application uses automated releases with semantic versioning.
Every merge to `main` triggers:

1. Automatic version bump based on commit messages
2. Docker image build and push to Docker Hub
3. Tagged with both version number and `latest`

**Docker Hub Repository:** `bcl1713/couch-to-5k`

## Pulling Pre-Built Images

### Latest Version

To pull the latest version:

```bash
docker pull bcl1713/couch-to-5k:latest
```

### Specific Version

To pull a specific version (recommended for production):

```bash
# Pull version 0.2.0
docker pull bcl1713/couch-to-5k:0.2.0

# Pull version 1.0.0
docker pull bcl1713/couch-to-5k:1.0.0
```

### Viewing Available Versions

Visit the Docker Hub repository to see all available versions:
<https://hub.docker.com/r/bcl1713/couch-to-5k/tags>

Or use the Docker CLI:

```bash
# List all tags (requires curl and jq)
curl -s https://hub.docker.com/v2/repositories/bcl1713/couch-to-5k/tags \
  | jq -r '.results[].name'
```

## Building the Docker Image (Optional)

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

#### Portainer Prerequisites

- Portainer installed on your server
- Docker daemon running and accessible by Portainer
- Port 3000 available on your server

#### Portainer Initial Deployment

1. In Portainer UI:
   1. Navigate to Containers → Create Container
   2. Enter container name: `couch-to-5k`
   3. Image: `bcl1713/couch-to-5k:0.2.0` (use specific version)
   4. Port mapping:
      - Container port: `3000`
      - Host port: `3000` (or your desired port)
   5. Environment variables (add):
      - `NODE_ENV=production`
      - `NEXTAUTH_SECRET=your-secret-key-here`
      - `NEXTAUTH_URL=http://your-server-ip:3000`
   6. Volumes (add):
      - Container path: `/app/data`
      - Volume: Create new volume named `couch-to-5k-data`
   7. Restart policy: Always
   8. Deploy

2. Verify container is running and app is accessible

#### Portainer Updates

When a new version is released:

1. Check the latest version on Docker Hub or GitHub releases
2. In Portainer:
   - Stop current container
   - Remove current container (data is safe in the volume)
   - Create new container with updated image tag:
     - Image: `bcl1713/couch-to-5k:0.3.0` (new version)
   - Use same port mappings, environment variables, and volume
   - Deploy

**Important:** Always use the same volume to preserve your data!

### Option 2: Docker CLI (Command Line)

#### CLI Initial Deployment

```bash
# Pull the specific version
docker pull bcl1713/couch-to-5k:0.2.0

# Create a volume for data persistence
docker volume create couch-to-5k-data

# Run container
docker run -d \
  --name couch-to-5k \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXTAUTH_SECRET=your-secret-key \
  -e NEXTAUTH_URL=http://your-server:3000 \
  -e DATABASE_PATH=/app/data/app.db \
  -v couch-to-5k-data:/app/data \
  --restart=always \
  bcl1713/couch-to-5k:0.2.0
```

#### CLI Updates

```bash
# Pull new version
docker pull bcl1713/couch-to-5k:0.3.0

# Stop and remove old container
docker stop couch-to-5k
docker rm couch-to-5k

# Start new container with new version
docker run -d \
  --name couch-to-5k \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXTAUTH_SECRET=your-secret-key \
  -e NEXTAUTH_URL=http://your-server:3000 \
  -e DATABASE_PATH=/app/data/app.db \
  -v couch-to-5k-data:/app/data \
  --restart=always \
  bcl1713/couch-to-5k:0.3.0
```

#### Useful Commands

```bash
# View running containers
docker ps

# View container logs
docker logs couch-to-5k

# Follow logs in real-time
docker logs -f couch-to-5k

# Stop container
docker stop couch-to-5k

# Start container
docker start couch-to-5k

# Remove container (data is safe in volume)
docker rm couch-to-5k

# List available versions locally
docker images bcl1713/couch-to-5k
```

### Option 3: Docker Compose (Recommended)

The application includes a `docker-compose.yml` file that orchestrates
the app and ensures data persistence using a Docker volume.

Update the `docker-compose.yml` to use the pre-built image:

```yaml
services:
  app:
    image: bcl1713/couch-to-5k:0.2.0
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/app/data/app.db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    volumes:
      - couch-to-5k-data:/app/data
    restart: always

volumes:
  couch-to-5k-data:
```

Create a `.env` file (don't commit this):

```bash
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://your-server:3000
```

#### Commands

```bash
# Start the application in the background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose stop

# Stop and remove containers (data is safe in volume)
docker-compose down

# Update to new version
# 1. Update image tag in docker-compose.yml
# 2. Pull new image
docker-compose pull
# 3. Restart with new image
docker-compose up -d
```

#### Data Persistence

The database is stored in a Docker volume named `couch-to-5k-data`.
This ensures that your user data and workout progress are preserved
even if the container is removed or updated. The database file is
located at `/app/data/app.db` inside the container.

## Version Management

### Semantic Versioning

The application follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR** (1.0.0): Breaking changes, major API changes
- **MINOR** (0.2.0): New features, non-breaking changes
- **PATCH** (0.2.1): Bug fixes, minor updates

### Choosing a Version

**For production:**

- Use specific version tags (e.g., `bcl1713/couch-to-5k:0.2.0`)
- Pin to a specific version for stability
- Update intentionally when new versions are released

**For development/testing:**

- Use `latest` tag for the newest version
- Be aware it will change with each release

### Version History

Check the changelog for version history:

- GitHub Releases:
  <https://github.com/yourusername/couch-to-5k/releases>
- CHANGELOG.md in the repository

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
