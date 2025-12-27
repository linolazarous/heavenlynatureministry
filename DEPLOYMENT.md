# Deployment Guide for Render

## Quick Setup Checklist

### ✅ Before You Deploy

1. **MongoDB Setup**
   - [ ] Create MongoDB Atlas cluster (or have MongoDB URL ready)
   - [ ] Whitelist Render IP addresses (0.0.0.0/0 for all IPs)
   - [ ] Get connection string

2. **Stripe Setup**
   - [ ] Create Stripe account
   - [ ] Get API keys (both secret and publishable)
   - [ ] Decide: Test keys or Live keys

3. **Domain Setup** (Optional but recommended)
   - [ ] Point www.heavenlynatureministry.com to Render
   - [ ] Configure DNS settings

---

## Backend Deployment on Render

### Step 1: Create Web Service
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository

### Step 2: Configure Service
- **Name**: `hnmbackend-gedp` (or your choice)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your production branch)
- **Root Directory**: Leave blank
- **Runtime**: `Python 3`
- **Build Command**: 
  ```bash
  pip install -r backend/requirements.txt
  ```
- **Start Command**:
  ```bash
  cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
  ```

### Step 3: Environment Variables
Add these in the "Environment" tab:

```
MONGO_URL=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=heavenly_nature_ministry
JWT_SECRET_KEY=your-super-secret-random-string-minimum-32-characters
STRIPE_SECRET_KEY=sk_test_or_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_or_live_your_stripe_publishable_key
CORS_ORIGINS=https://hnmfrontend-gedp.onrender.com,https://www.heavenlynatureministry.com
```

### Step 4: Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Note your backend URL: `https://hnmbackend-gedp.onrender.com`

---

## Frontend Deployment on Render

### Step 1: Create Static Site
1. Go to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect same GitHub repository

### Step 2: Configure Site
- **Name**: `hnmfrontend-gedp` (or your choice)
- **Region**: Same as backend
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Build Command**:
  ```bash
  cd frontend && yarn install && yarn build
  ```
- **Publish Directory**: `frontend/build`

### Step 3: Environment Variables
Add these in the "Environment" tab:

```
REACT_APP_BACKEND_URL=https://hnmbackend-gedp.onrender.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_your_stripe_publishable_key
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

### Step 4: Deploy
- Click "Create Static Site"
- Wait for build and deployment
- Your site will be live at: `https://hnmfrontend-gedp.onrender.com`

---

## Post-Deployment Steps

### 1. Test Backend API
Visit: `https://hnmbackend-gedp.onrender.com/api/`

Should return: `{"message": "Heavenly Nature Ministry API", "status": "online"}`

### 2. Test Frontend
Visit: `https://hnmfrontend-gedp.onrender.com`

Should load the home page successfully.

### 3. Create Admin User
1. Register a new user through the website
2. Go to MongoDB Atlas → Collections
3. Find your user in the `users` collection
4. Edit the document and change `role: "user"` to `role: "admin"`
5. Log in again to access admin dashboard at `/admin`

### 4. Test Key Features
- [ ] User registration and login
- [ ] View sermons, events, blog
- [ ] Submit contact form
- [ ] Make a test donation (use Stripe test cards)
- [ ] Access admin dashboard
- [ ] RSVP to an event

---

## Custom Domain Setup

### For www.heavenlynatureministry.com

1. **In Render** (Frontend):
   - Go to your static site settings
   - Click "Custom Domains"
   - Add: `www.heavenlynatureministry.com`
   - Render will provide DNS records

2. **In Your Domain Registrar**:
   - Add CNAME record:
     - Name: `www`
     - Value: `hnmfrontend-gedp.onrender.com`
   - Wait for DNS propagation (can take up to 48 hours)

3. **Update CORS**:
   - Add your custom domain to backend `CORS_ORIGINS`
   - Redeploy backend

---

## Environment Variables Quick Reference

### Backend Required
| Variable | Example | Where to Get |
|----------|---------|-------------|
| MONGO_URL | mongodb+srv://... | MongoDB Atlas |
| DB_NAME | heavenly_nature_ministry | Your choice |
| JWT_SECRET_KEY | random-32-char-string | Generate random |
| STRIPE_SECRET_KEY | sk_test_... | Stripe Dashboard |
| CORS_ORIGINS | https://your-frontend.com | Your frontend URL |

### Frontend Required
| Variable | Example | Where to Get |
|----------|---------|-------------|
| REACT_APP_BACKEND_URL | https://your-backend.com | Your backend URL |
| REACT_APP_STRIPE_PUBLISHABLE_KEY | pk_test_... | Stripe Dashboard |

---

## Stripe Test Cards

For testing donations:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0027 6000 3184`
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

---

## Troubleshooting

### Backend Won't Start
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure MongoDB URL is correct and accessible

### Frontend Build Fails
- Check if all dependencies are in package.json
- Verify environment variables
- Look for syntax errors in code

### CORS Errors
- Ensure backend CORS_ORIGINS includes your frontend URL
- Check if URLs have trailing slashes (be consistent)
- Redeploy backend after CORS changes

### Database Connection Fails
- Whitelist 0.0.0.0/0 in MongoDB Atlas Network Access
- Check MongoDB URL format
- Verify database name is correct

### Stripe Not Working
- Check if keys are correct (test vs live)
- Verify keys in both backend AND frontend
- Check Stripe Dashboard for errors

---

## Useful Render CLI Commands

```bash
# Install Render CLI
npm install -g @render-dot-com/cli

# Login to Render
render login

# Deploy service
render deploy --service-id=<your-service-id>

# View logs
render logs --service-id=<your-service-id>
```

---

## Support

If you need help:
1. Check Render logs for errors
2. Review environment variables
3. Test API endpoints directly
4. Contact: info@heavenlynatureministry.com

---

**Remember**: Always keep your API keys and secrets secure! Never commit them to GitHub.
