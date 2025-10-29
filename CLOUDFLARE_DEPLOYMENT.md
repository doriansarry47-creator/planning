# Cloudflare Pages Deployment Guide

## 🚨 Current Issue: 404 NOT_FOUND Error

If you're seeing a `404: NOT_FOUND` error from Cloudflare Pages, it means the deployment succeeded but the application isn't responding correctly. This is typically caused by:

### Common Causes:
1. ❌ Missing environment variables (`DATABASE_URL`, `JWT_SECRET`)
2. ❌ Database connection failure
3. ❌ Incorrect routing configuration
4. ❌ Build artifacts not properly deployed

## ✅ Fix: Configure Cloudflare Pages Secrets

### Step 1: Set Environment Variables

You **MUST** configure these secrets for your Cloudflare Pages project:

```bash
# Set DATABASE_URL (PostgreSQL connection string)
npx wrangler pages secret put DATABASE_URL --project-name webapp
# When prompted, paste:
# postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Set JWT_SECRET (secure random string)
npx wrangler pages secret put JWT_SECRET --project-name webapp
# When prompted, paste a secure secret (generate with: openssl rand -base64 32)
```

### Step 2: Verify Secrets Are Set

```bash
# List all secrets for your project
npx wrangler pages secret list --project-name webapp
```

You should see:
```
DATABASE_URL
JWT_SECRET
```

### Step 3: Alternative - Set via Cloudflare Dashboard

1. Go to **Cloudflare Dashboard** → **Pages**
2. Select your **webapp** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables for **Production**:
   - `DATABASE_URL`: `postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - `JWT_SECRET`: (generate with `openssl rand -base64 32`)

### Step 4: Trigger Redeployment

After setting the secrets, you need to trigger a new deployment:

**Option A: Via Git Push**
```bash
# Make a small change or trigger rebuild
git commit --allow-empty -m "Redeploy with environment variables"
git push origin main
```

**Option B: Via Wrangler**
```bash
# Rebuild and redeploy
npm run build
npx wrangler pages deploy dist --project-name webapp
```

**Option C: Via Cloudflare Dashboard**
1. Go to your project in Cloudflare Pages
2. Navigate to **Deployments**
3. Click **Retry deployment** on the latest deployment

## 🔍 Verify Database is Initialized

Make sure the database has been initialized with the schema:

```bash
# Test database connection
psql "postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require" -c "\dt"

# If tables are missing, run initialization
psql "postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require" -f init-db.sql
```

Expected tables:
- `admins`
- `patients`
- `appointments`
- `availability_slots`
- `notes`
- `unavailabilities`

## 📋 Deployment Checklist

Before deploying, ensure:

- [ ] ✅ Build completes successfully (`npm run build`)
- [ ] ✅ `dist` folder contains `_worker.js` and `_routes.json`
- [ ] ✅ Database is initialized with `init-db.sql`
- [ ] ✅ `DATABASE_URL` secret is set in Cloudflare Pages
- [ ] ✅ `JWT_SECRET` secret is set in Cloudflare Pages
- [ ] ✅ Database connection string is correct
- [ ] ✅ Database allows connections from Cloudflare IPs
- [ ] ✅ Admin account exists (admin@example.com / admin123)

## 🔧 Build Configuration

Your `package.json` build command should be:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

Cloudflare Pages build settings:
- **Build command**: `npm install && npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (project root)
- **Environment variables**: Set via Wrangler or Dashboard

## 🐛 Troubleshooting

### Error: "vite: not found"
✅ **FIXED** - Moved Vite to dependencies instead of devDependencies

### Error: "Cannot connect to database"
Check:
1. `DATABASE_URL` is set correctly in Cloudflare Pages secrets
2. Database connection string includes `?sslmode=require`
3. Neon database is active and not paused

### Error: "JWT token invalid"
Check:
1. `JWT_SECRET` is set in Cloudflare Pages secrets
2. Secret is at least 32 characters long
3. Same secret is used across all environments

### Error: "404 Not Found" on all routes
This is your current issue! Follow these steps:
1. Set `DATABASE_URL` and `JWT_SECRET` in Cloudflare Pages
2. Verify database is initialized
3. Redeploy the application
4. Check Cloudflare Pages logs for errors

## 📊 Monitoring Deployment

### Check Build Logs
```bash
# View recent deployment logs
npx wrangler pages deployment list --project-name webapp

# Tail logs for a specific deployment
npx wrangler pages deployment tail --project-name webapp
```

### Check Application Logs
After deployment, monitor the application:
```bash
# Real-time logs
npx wrangler pages deployment tail --project-name webapp
```

### Test Endpoints
After successful deployment, test these endpoints:

```bash
# Health check (should return HTML)
curl https://your-app.pages.dev/

# API health check
curl https://your-app.pages.dev/api/health

# Test admin login
curl -X POST https://your-app.pages.dev/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## 🔐 Security Recommendations

1. **Change default admin password** immediately after first deployment
2. **Use strong JWT_SECRET** (generate with `openssl rand -base64 32`)
3. **Enable HTTPS only** (automatic on Cloudflare Pages)
4. **Rotate secrets regularly** in production
5. **Monitor failed login attempts** in database logs

## 📞 Next Steps

After fixing the 404 error:

1. **Test the application** at your Cloudflare Pages URL
2. **Login as admin** (admin@example.com / admin123)
3. **Change the admin password** immediately
4. **Create availability slots** for appointments
5. **Test patient registration and booking**

## 🆘 Still Having Issues?

If you've followed all steps and still see 404 errors:

1. Check Cloudflare Pages dashboard for deployment errors
2. Verify environment variables are set correctly
3. Test database connection from your local machine
4. Review build logs for any warnings or errors
5. Ensure PostgreSQL database has the correct schema

---

**Last Updated**: 2025-10-29
**Status**: Awaiting environment variable configuration
