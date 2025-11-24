# Railway Deployment - Complete Documentation Index

## Quick Start

For a quick 5-minute overview, start here:
- **[QUICKSTART_DEPLOYMENT.md](QUICKSTART_DEPLOYMENT.md)** - Quick reference guide

## Planning & Setup

### Before You Deploy
1. **[RAILWAY_SETUP_CHECKLIST.md](RAILWAY_SETUP_CHECKLIST.md)** - Pre-deployment configuration checklist
   - Railway project setup
   - Environment variables configuration
   - GitHub secrets setup
   - Code quality verification

### Configuration Details
2. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
   - Environment variables explained
   - Local testing procedures
   - Manual deployment steps
   - CI/CD integration

## Deployment

### Automated Deployment
Use GitHub Actions CI/CD:
1. Push to main branch: `git push origin main`
2. Monitor pipeline: GitHub repository → Actions
3. Check deploy job status

### Manual Deployment
Use Railway CLI:
```bash
railway login
railway link
railway up --detach
```

## Verification & Testing

### Automated Testing
Run the verification script:
```bash
./scripts/verify-railway-deployment.sh <railway-domain> [access-token]
```

See [scripts/README.md](scripts/README.md) for details.

### Manual Testing
Follow the comprehensive smoke test suite:
- **[RAILWAY_DEPLOYMENT_VERIFICATION.md](RAILWAY_DEPLOYMENT_VERIFICATION.md)**
  - Health check verification
  - Migration status verification
  - Authentication flow testing
  - Database CRUD operations
  - CORS configuration validation

## Documentation Map

### For Different Roles

#### DevOps/Infrastructure Engineers
1. Start: [RAILWAY_SETUP_CHECKLIST.md](RAILWAY_SETUP_CHECKLIST.md)
2. Reference: [DEPLOYMENT.md](DEPLOYMENT.md)
3. Troubleshooting: [RAILWAY_DEPLOYMENT_VERIFICATION.md](RAILWAY_DEPLOYMENT_VERIFICATION.md) - Troubleshooting section
4. Infrastructure: [INFRASTRUCTURE.md](INFRASTRUCTURE.md)

#### Backend Developers
1. Start: [QUICKSTART_DEPLOYMENT.md](QUICKSTART_DEPLOYMENT.md)
2. Reference: [DEPLOYMENT.md](DEPLOYMENT.md) - Local Testing section
3. Testing: [RAILWAY_DEPLOYMENT_VERIFICATION.md](RAILWAY_DEPLOYMENT_VERIFICATION.md) - Smoke tests

#### Frontend Developers (Integration)
1. Environment setup: [DEPLOYMENT.md](DEPLOYMENT.md) - Environment Variables
2. CORS configuration: [RAILWAY_DEPLOYMENT_VERIFICATION.md](RAILWAY_DEPLOYMENT_VERIFICATION.md) - CORS Validation
3. API base URL: Check Railway dashboard for deployed domain
4. Set `NEXT_PUBLIC_API_URL` to Railway domain

#### Team Leads/Project Managers
1. Overview: [RAILWAY_VERIFICATION_SUMMARY.md](RAILWAY_VERIFICATION_SUMMARY.md)
2. Status: This checklist - verify all sections completed
3. References: [README.md](README.md) - Main project documentation

## Step-by-Step Deployment Workflow

### Phase 1: Pre-Deployment (1 hour)
```
1. ☐ Review RAILWAY_SETUP_CHECKLIST.md
2. ☐ Complete pre-deployment checklist items
3. ☐ Create Railway project
4. ☐ Add PostgreSQL plugin
5. ☐ Set environment variables
6. ☐ Configure GitHub secrets (RAILWAY_TOKEN)
7. ☐ Run local tests: docker-compose up
8. ☐ Push code changes to branch
```

### Phase 2: Deployment (15 minutes)
```
1. ☐ Choose deployment method:
     - Automated: git push origin main (triggers CI/CD)
     - Manual: railway up --detach
2. ☐ Monitor deployment progress
     - Railway dashboard OR
     - railway logs --follow
3. ☐ Verify database migrations
     - Check logs for migration messages
     - OR: railway run pnpm run prisma -- migrate status
```

### Phase 3: Post-Deployment Verification (20 minutes)
```
1. ☐ Get Railway domain from dashboard
2. ☐ Run automated tests:
     ./scripts/verify-railway-deployment.sh <domain>
3. ☐ Verify all tests pass
4. ☐ Manual smoke tests if automated fails:
     - Review RAILWAY_DEPLOYMENT_VERIFICATION.md
     - Run curl tests provided
5. ☐ Document final Railway URL
6. ☐ Update frontend NEXT_PUBLIC_API_URL
```

### Phase 4: Production Readiness (30 minutes)
```
1. ☐ Review acceptance criteria:
     - Health endpoint responding
     - Migrations applied
     - Auth flow working
     - CRUD operations working
     - CORS configured
2. ☐ Frontend integration testing
3. ☐ Team sign-off
4. ☐ Monitor logs for first hour
```

## Acceptance Criteria Checklist

- ✓ **Service Status**: Railway service is live and healthy
  - Check: `./scripts/verify-railway-deployment.sh <domain>`
  - Expected: All tests pass

- ✓ **Health Endpoint**: `/health` responds with status ok
  - Check: `curl https://<domain>/health | jq .`
  - Expected: `{ status: "ok", timestamp: "..." }`

- ✓ **Migrations**: Database migrations applied successfully
  - Check: `railway logs | grep -i migration`
  - Expected: Migration success messages in logs

- ✓ **Authentication**: User registration and login work
  - Check: Test in verification script or DEPLOYMENT.md
  - Expected: Valid JWT token returned

- ✓ **Database**: CRUD operations successful
  - Check: Watchlist create/read/update/delete tests
  - Expected: All operations return 200/201 responses

- ✓ **CORS**: Frontend domain allowed
  - Check: `curl -H "Origin: https://<frontend-domain>" ...`
  - Expected: `Access-Control-Allow-Origin` header matches

- ✓ **CI/CD**: Pipeline completed successfully
  - Check: GitHub Actions → CI/CD Pipeline → Latest run
  - Expected: All jobs green/passed

- ✓ **Documentation**: Updated with final values
  - Check: Railway domain documented
  - Check: Environment variables documented
  - Check: Verification steps documented

## Troubleshooting Quick Links

### Issue: Service won't start
→ [RAILWAY_DEPLOYMENT_VERIFICATION.md - Health Check Fails](RAILWAY_DEPLOYMENT_VERIFICATION.md#issue-health-check-fails-connection-refused)

### Issue: 502 Bad Gateway
→ [RAILWAY_DEPLOYMENT_VERIFICATION.md - 502 Bad Gateway](RAILWAY_DEPLOYMENT_VERIFICATION.md#issue-502-bad-gateway)

### Issue: Authentication fails
→ [RAILWAY_DEPLOYMENT_VERIFICATION.md - Authentication Fails](RAILWAY_DEPLOYMENT_VERIFICATION.md#issue-authentication-fails-invalid-token)

### Issue: CORS errors in browser
→ [RAILWAY_DEPLOYMENT_VERIFICATION.md - CORS Errors](RAILWAY_DEPLOYMENT_VERIFICATION.md#issue-cors-errors-in-browser)

### Issue: Database migration fails
→ [RAILWAY_DEPLOYMENT_VERIFICATION.md - Migration Fails](RAILWAY_DEPLOYMENT_VERIFICATION.md#issue-database-migration-fails)

### Issue: Service keeps restarting
→ [RAILWAY_DEPLOYMENT_VERIFICATION.md - Service Restarting](RAILWAY_DEPLOYMENT_VERIFICATION.md#issue-service-keeps-restarting)

## Environment Variables Reference

```env
# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/infocus

# Node Environment (Required)
NODE_ENV=production
PORT=3000

# Authentication (Required - generate with: openssl rand -hex 32)
JWT_ACCESS_SECRET=<64-char-hex-string>
JWT_REFRESH_SECRET=<64-char-hex-string>

# API (Required)
TMDB_API_KEY=<your-tmdb-api-key>

# CORS (Required - comma-separated for multiple origins)
CORS_ORIGIN=https://app.yourdomain.com
```

Generate secure secrets:
```bash
openssl rand -hex 32  # For JWT secrets
```

## Important Commands Reference

### Railway CLI
```bash
railway login              # Authenticate
railway link              # Link to project
railway variables list    # View all variables
railway status           # Check deployment status
railway logs --follow    # Stream logs in real-time
railway up --detach      # Deploy
railway rollback         # Rollback to previous version
railway domains list     # View public domain
```

### Verification
```bash
# Automated testing
./scripts/verify-railway-deployment.sh <domain>

# Manual health check
curl https://<domain>/health | jq .

# Check migrations
railway logs | grep -i migration
```

### Debugging
```bash
# View logs
railway logs --tail 100
railway logs --follow

# Check service status
railway status

# View deployments
railway deployments

# Manual migration
railway run pnpm run migrate:prod
```

## File Organization

```
.
├── DEPLOYMENT.md                          # Main deployment guide
├── INFRASTRUCTURE.md                      # Infrastructure reference
├── QUICKSTART_DEPLOYMENT.md              # Quick reference
├── RAILWAY_SETUP_CHECKLIST.md            # Pre-deployment checklist
├── RAILWAY_DEPLOYMENT_VERIFICATION.md    # Post-deployment verification
├── RAILWAY_VERIFICATION_SUMMARY.md       # Task summary
├── RAILWAY_DEPLOYMENT_INDEX.md           # This file
├── README.md                              # Project overview
├── railway.json                           # Railway configuration
├── .env.production.example                # Env template
├── .github/
│   └── workflows/
│       └── ci-cd.yml                     # CI/CD pipeline
├── apps/
│   └── api/
│       ├── Dockerfile                    # Multi-stage Docker build
│       ├── Procfile                      # Deployment config
│       ├── .dockerignore                 # Docker optimization
│       └── src/
│           ├── server.ts                 # Express server with health check
│           ├── index.ts                  # Entry point
│           └── routes/                   # API routes
└── scripts/
    ├── verify-railway-deployment.sh      # Automated verification script
    └── README.md                         # Scripts documentation
```

## Success Indicators

✓ All deployment checklist items completed
✓ Automated verification script passes all tests
✓ Health endpoint responds
✓ Authentication flow works
✓ Database operations successful
✓ CORS configured correctly
✓ CI/CD pipeline shows green status
✓ No errors in deployment logs
✓ Response times normal (< 500ms)
✓ Team sign-off obtained

## Support & References

- [Railway Documentation](https://docs.railway.app)
- [Railway CLI Reference](https://docs.railway.app/reference/cli-api)
- [Prisma Migration Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Express.js Health Checks](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

## Document Versions

| Document | Lines | Last Updated | Status |
|----------|-------|--------------|--------|
| DEPLOYMENT.md | 758 | 2024-11-24 | ✓ Complete |
| RAILWAY_SETUP_CHECKLIST.md | 395 | 2024-11-24 | ✓ Complete |
| RAILWAY_DEPLOYMENT_VERIFICATION.md | 670 | 2024-11-24 | ✓ Complete |
| RAILWAY_VERIFICATION_SUMMARY.md | 327 | 2024-11-24 | ✓ Complete |
| RAILWAY_DEPLOYMENT_INDEX.md | (this) | 2024-11-24 | ✓ Complete |
| scripts/verify-railway-deployment.sh | 300 | 2024-11-24 | ✓ Complete |
| scripts/README.md | 140 | 2024-11-24 | ✓ Complete |

## Getting Help

1. **Check this index** - You're reading it!
2. **Review RAILWAY_DEPLOYMENT_VERIFICATION.md** - Troubleshooting section
3. **Check logs**: `railway logs --follow`
4. **Run verification script**: `./scripts/verify-railway-deployment.sh <domain>`
5. **Consult team** - Share error messages and logs

---

**Last Updated**: November 24, 2024
**Total Documentation**: 2,800+ lines
**Status**: ✓ Production Ready
