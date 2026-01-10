# Deployment Guide - MySQL Configuration

## 🚀 Deploying with MySQL

Your application is now configured to use MySQL. Follow these steps to deploy:

### 1. Update Environment Variables on Your Deployment Platform

Set these environment variables on your hosting platform (Render, Heroku, Railway, etc.):

```env
# CRITICAL: Set database type to MySQL
DB_TYPE=mysql

# MySQL Configuration
MYSQL_HOST=srv1743.hstgr.io
MYSQL_PORT=3306
MYSQL_DATABASE=u287046787_zenz
MYSQL_USERNAME=u287046787_zenz
MYSQL_PASSWORD=0xIDaUNGg1n|

# Server Configuration
NODE_ENV=production
PORT=5000

# JWT Configuration
JWT_SECRET=your_production_jwt_secret_key_here
JWT_EXPIRE=30d

# Frontend URL (update with your actual frontend URL)
FRONTEND_URL=https://your-frontend-domain.com
```

### 2. Platform-Specific Instructions

#### **Render.com**
1. Go to your service dashboard
2. Click "Environment" tab
3. Add each environment variable from above
4. Click "Save Changes"
5. Render will automatically redeploy

#### **Heroku**
```bash
heroku config:set DB_TYPE=mysql
heroku config:set MYSQL_HOST=srv1743.hstgr.io
heroku config:set MYSQL_DATABASE=u287046787_zenz
heroku config:set MYSQL_USERNAME=u287046787_zenz
heroku config:set MYSQL_PASSWORD="0xIDaUNGg1n|"
heroku config:set JWT_SECRET=your_jwt_secret
```

#### **Railway.app**
1. Go to your project
2. Click "Variables" tab
3. Add each environment variable
4. Railway will auto-redeploy

#### **Vercel/Netlify (Serverless)**
1. Go to project settings
2. Navigate to "Environment Variables"
3. Add each variable
4. Redeploy

### 3. Verify Deployment

After deploying, check the logs to ensure MySQL connection is successful:

```
🔌 Connecting to MYSQL database...
✓ MySQL connected successfully
✓ MySQL tables synchronized
```

If you see MongoDB connection messages, the environment variables weren't loaded correctly.

### 4. Common Issues

#### Issue: Still connecting to MongoDB
**Solution**: Make sure `DB_TYPE=mysql` is set in your deployment environment variables.

#### Issue: MySQL connection timeout
**Solution**:
- Verify your MySQL server allows external connections
- Check if your hosting provider's IP is whitelisted in MySQL
- Verify credentials are correct

#### Issue: Tables not created
**Solution**: The application auto-creates tables on first connection. Just restart the service.

### 5. Database Migration in Production

If you need to migrate existing MongoDB data to MySQL in production:

1. Set both MongoDB and MySQL credentials in environment
2. Run migration script:
```bash
node scripts/migrate-to-mysql.js
```
3. Switch `DB_TYPE` to `mysql`
4. Restart application

### 6. Rolling Back to MongoDB

If you need to switch back to MongoDB:

1. Update environment variable: `DB_TYPE=mongodb`
2. Ensure `MONGO_URI` is set
3. Restart application

### 7. Performance Tips for Production

1. **Connection Pooling**: Already configured in MySQL config
2. **Indexes**: Auto-created for frequently queried fields
3. **Caching**: Consider adding Redis for API caching
4. **SSL**: Enable SSL for MySQL connection in production:

```javascript
// In config/database.js, update mysqlConfig:
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}
```

### 8. Monitoring

Monitor your MySQL database:
- Connection count
- Query performance
- Slow queries
- Storage usage

Use your hosting provider's MySQL dashboard or tools like phpMyAdmin.

### 9. Backup Strategy

**Automated Backups**: Your MySQL hosting should provide automatic backups
**Manual Backup**:
```bash
mysqldump -h srv1743.hstgr.io -u u287046787_zenz -p u287046787_zenz > backup.sql
```

### 10. Security Checklist

- ✓ Use strong JWT_SECRET in production
- ✓ Enable MySQL SSL
- ✓ Use environment variables (never commit credentials)
- ✓ Set NODE_ENV=production
- ✓ Whitelist only necessary IPs for MySQL access
- ✓ Regular security updates
- ✓ Monitor for suspicious queries

## 📊 Quick Deployment Checklist

- [ ] Set `DB_TYPE=mysql` in environment variables
- [ ] Set all MySQL credentials
- [ ] Set `JWT_SECRET` to a strong value
- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL`
- [ ] Verify deployment logs show MySQL connection
- [ ] Test API endpoints
- [ ] Verify data is accessible
- [ ] Set up monitoring
- [ ] Configure backups

## 🆘 Support

If you encounter issues:
1. Check deployment logs
2. Verify environment variables are set correctly
3. Test MySQL connection from deployment platform
4. Check firewall/security groups allow MySQL connection
