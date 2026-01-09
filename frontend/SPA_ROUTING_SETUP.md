# SPA Routing Setup Guide

This document explains how to fix 404 errors when directly accessing routes in your React SPA.

## Problem
When you navigate directly to routes like `/trip/123`, `/login`, `/profile`, etc., you get a 404 error because the server doesn't know these routes exist. React Router handles routing on the client side, so the server needs to be configured to always serve `index.html` for all routes.

## Solutions by Platform

### 1. **Vercel** (Recommended for React apps)
**File:** `vercel.json` (✅ Already created)

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Deploy:** Just push to GitHub and connect to Vercel. It will automatically use this config.

---

### 2. **Netlify**
**File:** `public/_redirects` (✅ Already created)

```
/* /index.html 200
```

**OR** `netlify.toml` (✅ Already created)

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Deploy:** Drag & drop your `dist` folder to Netlify, or connect via GitHub.

---

### 3. **Apache Server (.htaccess)**
**File:** `public/.htaccess` (✅ Already created)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

**Note:** Make sure `mod_rewrite` is enabled on your Apache server.

---

### 4. **Nginx**
Add this to your Nginx config:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

### 5. **Express.js Backend**
If you're serving the React build from an Express server:

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(3000);
```

---

## Development Mode

### Vite (Current setup)
Vite automatically handles SPA routing in dev mode. Just run:

```bash
npm run dev
```

Then navigate to any route like `http://localhost:5173/trip/123` - it should work!

---

## Testing

### 1. Local Development
```bash
npm run dev
```
Try accessing: `http://localhost:5173/trip/test123`

### 2. Production Build (Preview)
```bash
npm run build
npm run preview
```
Then try accessing routes directly.

### 3. Deployed Site
After deploying, test these URLs directly in the browser:
- `https://yoursite.com/trip/123`
- `https://yoursite.com/login`
- `https://yoursite.com/profile`

---

## Common Issues

### Issue 1: Still getting 404 in production
**Solution:**
- Make sure you've rebuilt: `npm run build`
- Redeploy the site
- Check that the correct config file is in the deployed folder

### Issue 2: 404 only on refresh
**Solution:**
- This means the config file is missing or not working
- Check the platform-specific file exists in the build
- For Vite, files in `public/` are copied to `dist/` during build

### Issue 3: Works locally but not in production
**Solution:**
- Different hosting platforms need different configs
- Double-check you're using the right file for your platform
- Clear CDN cache if using one

---

## Current Setup Status

✅ `public/_redirects` - For Netlify
✅ `vercel.json` - For Vercel
✅ `netlify.toml` - Alternative for Netlify
✅ `public/.htaccess` - For Apache servers
✅ 404 Page component created
✅ Catch-all route added to App.jsx

## Next Steps

1. **Rebuild your app:**
   ```bash
   npm run build
   ```

2. **Deploy to your platform** (Vercel/Netlify/etc.)

3. **Test direct URL navigation**

4. If still having issues, check:
   - Browser console for errors
   - Network tab to see what files are loading
   - Hosting platform logs

---

## Need Help?

If you're still seeing 404 errors, please provide:
1. Which platform you're deploying to
2. Whether it's happening in dev or production
3. The exact URL that's giving 404
4. Any error messages from console
