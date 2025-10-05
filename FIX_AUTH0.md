# 🔐 Fix Auth0 Configuration for farmpro.tech

## The Problem
Your Auth0 app is currently only configured for `localhost:3000`, but now you're accessing via `farmpro.tech`, causing 500 errors on the callback.

## ✅ Solution: Update Auth0 Dashboard

### Step 1: Go to Auth0 Dashboard
1. Visit: https://manage.auth0.com/
2. Log in to your account
3. Go to **Applications** → **Applications**
4. Click on your application (the one with Client ID: `pAP62TeM2JUlaNRS0Ub7pqBOxEIGjNom`)

### Step 2: Update Application URIs

Find these fields and **ADD** the farmpro.tech URLs (keep localhost too for development):

**Allowed Callback URLs:**
```
http://localhost:3000/auth/callback,
https://farmpro.tech/auth/callback,
https://www.farmpro.tech/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000,
https://farmpro.tech,
https://www.farmpro.tech
```

**Allowed Web Origins:**
```
http://localhost:3000,
https://farmpro.tech,
https://www.farmpro.tech
```

**Allowed Origins (CORS):**
```
http://localhost:3000,
https://farmpro.tech,
https://www.farmpro.tech
```

### Step 3: Save Changes
Click **Save Changes** at the bottom of the page

### Step 4: Restart Your Frontend
After updating Auth0, restart your frontend:
1. Press `Ctrl+C` in the frontend terminal
2. Run `./start_frontend.sh` again

## 🧪 Testing

After restarting:
- Visit: https://farmpro.tech
- Try to log in
- Should work without 500 errors!

## 💡 Development vs Production

I've updated your `.env.local` to use:
```
AUTH0_BASE_URL=https://farmpro.tech
```

When developing locally, change it to:
```
AUTH0_BASE_URL=http://localhost:3000
```

Or better yet, create a `.env.production` file for production settings!
