# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your application.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" dropdown at the top
3. Click "New Project"
4. Enter project name (e.g., "Zenz Awara")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Click "Create"
4. Fill in the required fields:
   - App name: `Zenz Awara`
   - User support email: Your email
   - Developer contact information: Your email
5. Click "Save and Continue"
6. On Scopes page, click "Add or Remove Scopes"
7. Add these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
8. Click "Save and Continue"
9. Click "Save and Continue" on Test users page
10. Click "Back to Dashboard"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as Application type
4. Enter name: `Zenz Awara Web Client`
5. Add Authorized JavaScript origins:
   - `http://localhost:5173` (for local development)
   - `https://your-frontend-domain.com` (for production)
6. Add Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for local development)
   - `https://zenz-backend.onrender.com/api/auth/google/callback` (for production)
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**

## Step 5: Update Environment Variables

### For Local Development:

Edit `backend/.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### For Production (Render.com):

1. Go to your Render.com dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add these environment variables:
   - `GOOGLE_CLIENT_ID`: Your Google Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google Client Secret
   - `GOOGLE_CALLBACK_URL`: `https://zenz-backend.onrender.com/api/auth/google/callback`

## Step 6: Update Frontend URL (if different)

If your frontend is deployed on a different domain, update the `FRONTEND_URL` in your `.env` file:

```env
# For local development
FRONTEND_URL=http://localhost:5173

# For production
FRONTEND_URL=https://your-frontend-domain.com
```

## Testing the Integration

### Local Testing:

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to `http://localhost:5173/login`
4. Click on "Google" button
5. You should be redirected to Google login
6. After successful authentication, you'll be redirected back to your app

### Production Testing:

1. Deploy your backend and frontend
2. Ensure all environment variables are set correctly
3. Test the Google login flow on your live site

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - Make sure the callback URL in Google Console exactly matches your backend URL
   - Check for trailing slashes

2. **"Access blocked: Authorization Error"**
   - Make sure you've added your email as a test user in the OAuth consent screen
   - Or publish your app (if ready for production)

3. **"Invalid client" error**
   - Double-check your Client ID and Client Secret
   - Make sure there are no extra spaces

4. **Can't reach callback URL**
   - Ensure your backend is running
   - Check firewall settings
   - Verify the callback route exists in your backend

## Security Notes

- Never commit your `.env` file to version control
- Keep your Client Secret secure
- Use HTTPS in production
- Regularly rotate your credentials

## Support

For more information, visit:
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google OAuth Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
