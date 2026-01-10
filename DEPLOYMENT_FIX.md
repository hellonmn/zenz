# 🔧 Quick Fix for Deployment Error

## The Problem
Your deployed app is trying to connect to MongoDB, but you've migrated to MySQL.

Error: `Operation 'trips.find()' buffering timed out after 10000ms`

## The Solution

### Step 1: Update Environment Variables on Render.com

1. Go to https://dashboard.render.com
2. Find your backend service (`zenz-backend` or similar)
3. Click on the service
4. Go to **"Environment"** tab in the left sidebar
5. Click **"Add Environment Variable"** button

### Step 2: Add These Variables

Add each of these (click "+ Add Environment Variable" for each):

| Key | Value |
|-----|-------|
| `DB_TYPE` | `mysql` |
| `MYSQL_HOST` | `srv1743.hstgr.io` |
| `MYSQL_PORT` | `3306` |
| `MYSQL_DATABASE` | `u287046787_zenz` |
| `MYSQL_USERNAME` | `u287046787_zenz` |
| `MYSQL_PASSWORD` | `0xIDaUNGg1n|` |

### Step 3: Remove or Update MongoDB Variable (Optional)

If there's a `MONGO_URI` variable, you can:
- Leave it (won't be used when `DB_TYPE=mysql`)
- Or remove it to avoid confusion

### Step 4: Save and Wait for Auto-Deploy

1. Click **"Save Changes"** button
2. Render will automatically redeploy your service
3. Wait 2-3 minutes for deployment to complete

### Step 5: Verify It's Working

After deployment completes, check:

**Health Check:**
```
https://server.zenzaawara.com/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Tourism API is running",
  "database": "mysql",
  "timestamp": "2026-01-11T..."
}
```

**Check if database is "mysql"** ✓

**Test API:**
```
https://server.zenzaawara.com/api/trips/popular
```

Should return trips data (not a timeout error).

## Troubleshooting

### Still getting MongoDB error?
- Environment variables might not have saved correctly
- Try manually redeploying: Click "Manual Deploy" → "Deploy latest commit"

### MySQL connection error?
- Check if Render's IP is whitelisted in your MySQL server
- Verify MySQL credentials are correct

### App won't start?
- Check deployment logs in Render dashboard
- Look for "MySQL connected successfully" message

## After Fixing

Once deployed successfully, you should see in the logs:
```
🔌 Connecting to MYSQL database...
✓ MySQL connected successfully
✓ MySQL tables synchronized
🚀 Server running in production mode on port XXXX
```

## Admin Login Credentials

- **Email**: `admin@zenzawara.com`
- **Password**: `ThisIsNotMyPassword@1999`

---

## Summary Checklist

- [ ] Go to Render dashboard
- [ ] Add `DB_TYPE=mysql` environment variable
- [ ] Add all MySQL credentials (host, port, database, username, password)
- [ ] Save changes (auto-redeploys)
- [ ] Wait 2-3 minutes
- [ ] Check `/health` endpoint shows `"database": "mysql"`
- [ ] Test API endpoints work
- [ ] Login to admin panel

**Need help?** Check the logs in Render dashboard for any error messages.
