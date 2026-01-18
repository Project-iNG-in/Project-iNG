# Build & Deploy Pipeline - Complete Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Quick Start](#quick-start)
4. [Pipeline Architecture](#pipeline-architecture)
5. [Setup Steps](#setup-steps)
6. [Monitoring & Verification](#monitoring--verification)
7. [Troubleshooting](#troubleshooting)
8. [Configuration](#configuration)

---

## Overview

This is a complete **End-to-End Build & Deploy Pipeline** that:
- ✅ Builds TypeScript + Vite application
- ✅ Type-checks with TypeScript
- ✅ Builds Docker image
- ✅ Pushes to GitHub Container Registry (GHCR)
- ✅ Auto-deploys to Staging (develop branch)
- ✅ Auto-deploys to Production (main branch)
- ❌ **NO TESTS** (as requested)

**Status**: ✅ Ready for Deployment

---

## Project Structure

```
Project-iNG/
├── .github/
│   └── workflows/
│       └── deploy.yml                 ✅ Build & Deploy Pipeline
├── src/
│   ├── counter.ts
│   ├── main.ts
│   ├── style.css
│   ├── todos.ts
│   └── __tests__/
│       ├── setup.ts
│       ├── todos.test.ts
│       └── __snapshots__/
├── public/
├── coverage/
├── dist/
├── .babelrc
├── .dockerignore
├── .gitignore
├── default.conf
├── docker-compose.yml
├── Dockerfile
├── index.html
├── jest.config.js
├── nginx.conf
├── package.json
├── pnpm-lock.yaml
├── sonarcloud.yml
├── tsconfig.json
└── README.md
```

**Changes Made**:
- ✅ Deleted `my-app/` folder
- ✅ Moved all files to root
- ✅ Removed old conflicting workflows
- ✅ Kept only `deploy.yml`

---

## Quick Start

### 5-Minute Setup

#### Step 1: Prerequisites
```bash
# Verify installed
gh auth login      # GitHub CLI
git --version      # Git
pnpm --version     # pnpm
docker --version   # Docker (for local testing)
```

#### Step 2: Add GitHub Secrets
Go to **Settings > Secrets and variables > Actions**:

| Secret | Value |
|--------|-------|
| `DEPLOY_KEY` | SSH private key for deployment |
| `STAGING_HOST` | `user@staging-server.com` |
| `PROD_HOST` | `user@production-server.com` |

#### Step 3: Create GitHub Environments
Go to **Settings > Environments**:

**Staging**
- Name: `staging`
- Deployment branches: `develop`
- URL: `https://staging.example.com`

**Production**
- Name: `production`
- Deployment branches: `main`
- URL: `https://example.com`

#### Step 4: Commit & Push
```bash
git add .
git commit -m "Configure Build & Deploy Pipeline"
git push origin develop    # Test staging deployment
git push origin main       # Test production deployment
```

#### Step 5: Monitor
Go to **Actions** tab → Watch **Build & Deploy Pipeline** run

---

## Pipeline Architecture

### Pipeline Flow

```
Your Code Push
      ↓
   BUILD JOB
   ├─ Setup Node.js 20 & pnpm 8
   ├─ Install dependencies
   ├─ Type check TypeScript
   ├─ Build Vite bundle
   └─ Upload artifacts
      ↓
  DOCKER BUILD JOB
   ├─ Build Docker image
   └─ Push to GHCR
      ↓
   ┌─────────────────┬─────────────────┐
   ↓                 ↓
 STAGING DEPLOY   PRODUCTION DEPLOY
 (develop branch)  (main branch)
```

### Jobs Details

#### Job 1: BUILD
- **Trigger**: Push to main or develop
- **Duration**: 2-3 minutes
- **Steps**:
  1. Checkout code
  2. Setup Node.js 20
  3. Setup pnpm 8
  4. Configure caching
  5. Install dependencies
  6. Type check TypeScript
  7. Build with Vite
  8. Verify dist/ folder
  9. Upload artifacts

#### Job 2: BUILD-DOCKER
- **Trigger**: Push event + successful BUILD
- **Duration**: 1-2 minutes
- **Steps**:
  1. Setup Docker Buildx
  2. Login to GHCR
  3. Extract metadata
  4. Build and push Docker image
  5. Cache layers

#### Job 3: DEPLOY-STAGING
- **Trigger**: Push to develop + successful BUILD-DOCKER
- **Environment**: staging
- **Duration**: 1-2 minutes
- **Steps**:
  1. Pull Docker image
  2. Deploy to staging server
  3. Verify deployment

#### Job 4: DEPLOY-PRODUCTION
- **Trigger**: Push to main + successful BUILD-DOCKER
- **Environment**: production
- **Duration**: 1-2 minutes
- **Steps**:
  1. Pull Docker image
  2. Deploy to production server
  3. Run health checks

---

## Setup Steps

### Phase 1: Local Verification (5 minutes)

```bash
# Build locally
pnpm install
pnpm build

# Verify Dockerfile
docker build -t my-app:latest .
docker run -p 80:80 my-app:latest

# Test access
curl http://localhost
```

### Phase 2: GitHub Configuration (10 minutes)

1. **Add Secrets**
   ```
   DEPLOY_KEY        = SSH private key (chmod 600)
   STAGING_HOST      = user@staging.example.com
   PROD_HOST         = user@production.example.com
   ```

2. **Create Environments**
   - staging (URL: https://staging.example.com)
   - production (URL: https://example.com)

3. **Branch Protection (Optional)**
   - Require PR reviews on main
   - Require status checks pass
   - Restrict push access

### Phase 3: Deploy Pipeline Files (5 minutes)

```bash
# Files are already in place:
# - .github/workflows/deploy.yml
# - Dockerfile
# - docker-compose.yml
# - All source files in src/

git add .github/workflows/deploy.yml
git commit -m "Add Build & Deploy Pipeline"
git push origin main
```

### Phase 4: Test Pipeline (10 minutes)

1. **Monitor Build**
   - Go to Actions tab
   - Click Build & Deploy Pipeline
   - Watch build job
   - Verify no TypeScript errors
   - Confirm Vite build success

2. **Monitor Docker**
   - Check Docker build step
   - Verify push to GHCR
   - Confirm image tagging

3. **Monitor Deployment**
   - Watch deployment job
   - SSH to server
   - Verify container running
   - Check application access

---

## Monitoring & Verification

### GitHub Actions Monitoring

```bash
# View workflow runs
gh run list --workflow deploy.yml --limit 5

# View specific run
gh run view <run-id>

# Stream logs
gh run view <run-id> --log

# Rerun failed job
gh run rerun <run-id>

# Cancel running job
gh run cancel <run-id>
```

### Server-Side Verification

```bash
# SSH to server
ssh user@host

# Check container status
docker ps -a
docker ps | grep my-app-nginx

# View container logs
docker logs my-app-nginx
docker logs -f my-app-nginx    # Follow logs

# Check image
docker images | grep my-app
docker inspect <container-id>

# Test endpoint
curl http://localhost/
curl http://localhost/health    # If implemented

# Check resources
docker stats my-app-nginx
```

### Docker Registry

```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# List images
docker images | grep ghcr.io

# Pull image
docker pull ghcr.io/username/repo:latest
docker pull ghcr.io/username/repo:develop

# Inspect image
docker inspect ghcr.io/username/repo:latest
```

---

## Troubleshooting

### Build Fails

**Issue**: TypeScript compilation errors

```bash
# Check locally
pnpm exec tsc --noEmit

# Fix errors in src/
# Retry pipeline: gh run rerun <run-id>
```

**Issue**: Vite build errors

```bash
# Check local build
pnpm build

# Review dist/ contents
ls -la dist/

# Check GitHub Actions logs for details
```

### Docker Build Fails

**Issue**: Docker image build fails

```bash
# Test build locally
docker build -t my-app:test .

# Check Dockerfile syntax
cat Dockerfile

# View detailed error in Actions logs
```

**Issue**: Cannot push to GHCR

```bash
# Verify GitHub token
gh auth status

# Check image exists
docker images | grep my-app

# Manual push test
docker login ghcr.io
docker push ghcr.io/username/repo:test
```

### Deployment Fails

**Issue**: Cannot connect to deployment server

```bash
# Verify SSH key
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key

# Test SSH connection
ssh -i ~/.ssh/deploy_key user@staging.example.com

# Check GitHub secret
gh secret list | grep DEPLOY_KEY
```

**Issue**: Container won't start

```bash
# Check container logs
docker logs <container-name>

# Check resource limits
docker inspect <container-name>

# Check port bindings
docker port <container-name>

# Restart container
docker restart <container-name>
```

**Issue**: Application not accessible

```bash
# Check container running
docker ps | grep my-app-nginx

# Check port 80 open
curl http://localhost/
curl http://localhost:80/

# Check nginx config
docker exec <container-id> cat /etc/nginx/nginx.conf

# Check firewall
sudo firewall-cmd --list-ports
```

---

## Configuration

### Environment Variables

Edit `.github/workflows/deploy.yml`:

```yaml
env:
  REGISTRY: 'ghcr.io'              # Container registry
  IMAGE_NAME: ${{ github.repository }}
  NODE_VERSION: '20'               # Node.js version
  PNPM_VERSION: '8'                # pnpm version
```

### Docker Image Tags

Automatically tagged with:
- Branch name: `develop`, `main`
- Semantic version: `v1.0.0`
- Git SHA: `abc123def...`
- Latest: `latest` (main branch only)

Example tags:
- `ghcr.io/username/repo:develop`
- `ghcr.io/username/repo:main`
- `ghcr.io/username/repo:latest`

### Deployment Configuration

**Staging Server Deployment Script** (`deploy.sh`):

```bash
#!/bin/bash

REGISTRY="ghcr.io"
IMAGE="$REGISTRY/username/repo:develop"
CONTAINER="my-app-nginx"

# Login
echo $GITHUB_TOKEN | docker login $REGISTRY -u USERNAME --password-stdin

# Pull latest
docker pull $IMAGE

# Stop old
docker stop $CONTAINER 2>/dev/null || true
docker rm $CONTAINER 2>/dev/null || true

# Start new
docker run -d \
  --name $CONTAINER \
  -p 80:80 \
  --restart unless-stopped \
  $IMAGE

# Verify
sleep 3
curl -f http://localhost/ && echo "✅ Success" || exit 1
```

**Using Docker Compose**:

```yaml
version: '3.8'

services:
  app:
    image: ghcr.io/username/repo:latest
    container_name: my-app-nginx
    ports:
      - "80:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 10s
      timeout: 5s
      retries: 3
```

Deploy with:
```bash
docker-compose pull
docker-compose up -d
```

### Build Caching

Docker layer caching is enabled:
```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

This caches layers in GitHub Actions, speeding up builds.

---

## Performance Metrics

### Typical Build Times
| Step | Duration |
|------|----------|
| Build job | 2-3 minutes |
| Docker build | 1-2 minutes |
| Deployment | 1-2 minutes |
| **Total** | **4-7 minutes** |

### Optimization Tips
1. Docker layer caching (enabled)
2. pnpm dependency caching (enabled)
3. GitHub Actions cache (enabled)
4. Parallel job execution (where possible)

---

## Security Features

- ✅ GitHub Container Registry authentication
- ✅ SSH key-based deployment
- ✅ GitHub Secrets for sensitive data
- ✅ Artifact retention limits (7 days)
- ✅ Docker image signing (optional)
- ✅ Environment-based access control

---

## Next Steps

### Immediate (Today)
1. ✅ Add GitHub Secrets (DEPLOY_KEY, hosts)
2. ✅ Create GitHub Environments
3. ✅ Push to repository
4. ✅ Monitor first pipeline run

### Short Term (This Week)
1. ✅ Verify staging deployment works
2. ✅ Verify production deployment works
3. ✅ Test container health checks
4. ✅ Document deployment procedures

### Long Term (Future)
1. Add smoke tests in deployment jobs
2. Add Slack/Discord notifications
3. Implement canary deployments
4. Add automatic rollback procedures
5. Set up log aggregation

---

## Checklist

### Before Pushing
- [ ] Local build works: `pnpm build` ✅
- [ ] Docker builds locally
- [ ] package.json in root
- [ ] Dockerfile in root
- [ ] .github/workflows/deploy.yml exists
- [ ] No test files blocking deployment

### GitHub Configuration
- [ ] Secrets added (DEPLOY_KEY, hosts)
- [ ] Environments created (staging, production)
- [ ] Branch protection rules (optional)
- [ ] Environment URLs configured

### After First Push
- [ ] Build job completes successfully
- [ ] Docker image builds and pushes
- [ ] Staging deployment succeeds
- [ ] Container running on staging server
- [ ] Application accessible at staging URL

---

## Useful Commands

```bash
# GitHub CLI
gh auth login
gh workflow view deploy.yml
gh run list --workflow deploy.yml
gh run view <run-id> --log

# Git
git add .
git commit -m "message"
git push origin develop
git push origin main

# Local Testing
pnpm install
pnpm build
docker build -t my-app:test .
docker run -p 80:80 my-app:test

# Server Access
ssh user@host
docker ps -a
docker logs <container>
docker stats
docker-compose ps
docker-compose logs -f
```

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments)
- [Docker Documentation](https://docs.docker.com/)
- [Vite Documentation](https://vitejs.dev/)

---

## Support

For issues:
1. Check GitHub Actions logs (Actions tab)
2. Review container logs (`docker logs`)
3. Test locally (`pnpm build`, `docker run`)
4. Check secrets are configured
5. Verify SSH keys have correct permissions

---

**Status**: ✅ Ready to Deploy  
**Last Updated**: January 18, 2026  
**Pipeline**: Build & Deploy Only (No Tests)  
**Deployment**: Automatic to Staging & Production
