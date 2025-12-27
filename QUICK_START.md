# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Setup Environment Variables

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env and fill in:
# - MONGO_URL (your MongoDB connection string)
# - JWT_SECRET_KEY (random 32+ character string)
# - STRIPE_SECRET_KEY (from Stripe dashboard)
# - CORS_ORIGINS (your frontend URL)
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
# Edit .env and fill in:
# - REACT_APP_BACKEND_URL (your backend URL)
# - REACT_APP_STRIPE_PUBLISHABLE_KEY (from Stripe dashboard)
```

### Step 2: Get Required Services

1. **MongoDB** - Get free cluster at https://mongodb.com/cloud/atlas
2. **Stripe** - Get API keys at https://dashboard.stripe.com/apikeys

### Step 3: Deploy to Render

Follow the detailed guide in `DEPLOYMENT.md`

Or read the full documentation in `README.md`

---

**Need Help?** Email: info@heavenlynatureministry.com
