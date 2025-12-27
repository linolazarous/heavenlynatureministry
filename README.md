# Heavenly Nature Ministry Website

A complete church/ministry website with sermon management, events, blog, donations (Stripe integration), user registration, and admin dashboard.

## 🚀 Features

### Public Features
- **Home Page**: Hero section, featured sermons, upcoming events
- **About Us**: Mission, vision, values, and story
- **Sermons**: Browse and watch/listen to sermons with search
- **Events**: View and RSVP to upcoming church events
- **Blog**: Read articles and spiritual insights
- **Donations**: Secure online giving via Stripe
- **Contact Form**: Get in touch with the ministry
- **User Registration & Login**: JWT-based authentication

### Admin Features
- **Admin Dashboard**: Overview of all site statistics
- **Content Management**: Manage sermons, events, and blog posts (API-based)
- **View Donations**: Track all contributions
- **Contact Submissions**: Review messages from visitors

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (with Motor async driver)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Payments**: Stripe integration
- **File Structure**: RESTful API with proper routing

### Frontend
- **Framework**: React 19
- **Routing**: React Router v7
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Notifications**: Sonner (toast notifications)

## 📋 Prerequisites

- **Python 3.9+**
- **Node.js 18+** and Yarn
- **MongoDB** (Atlas or local instance)
- **Stripe Account** (for payment processing)

## ⚙️ Environment Variables Setup

### Backend (.env file in `/backend`)

```env
# MongoDB Configuration
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=heavenly_nature_ministry

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# Stripe Configuration (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# CORS Configuration
CORS_ORIGINS=https://hnmfrontend-gedp.onrender.com,https://www.heavenlynatureministry.com

# Email Configuration (Optional - for contact form notifications)
EMAIL_FROM=info@heavenlynatureministry.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend (.env file in `/frontend`)

```env
# Backend API URL
REACT_APP_BACKEND_URL=https://hnmbackend-gedp.onrender.com

# Stripe Publishable Key (Get from https://dashboard.stripe.com/apikeys)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# WebSocket Configuration (for Render deployment)
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

## 🚀 Local Development Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create and configure `.env` file (see example above)

4. Run the backend server:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
yarn install
```

3. Create and configure `.env` file (see example above)

4. Run the development server:
```bash
yarn start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

## 🌐 Production Deployment on Render

### Backend Deployment

1. **Create a Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure Build & Start Commands**:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`
4. **Set Environment Variables** in Render dashboard (all variables from backend `.env`)
5. **Deploy!**

### Frontend Deployment

1. **Create a Static Site** on Render
2. **Connect your GitHub repository**
3. **Configure Build Settings**:
   - **Build Command**: `cd frontend && yarn install && yarn build`
   - **Publish Directory**: `frontend/build`
4. **Set Environment Variables** in Render dashboard (all variables from frontend `.env`)
5. **Deploy!**

## 📝 Creating Admin User

After deployment, you need to create an admin user manually in MongoDB:

1. Register a regular user through the website
2. In MongoDB, find the user document
3. Update the `role` field from `"user"` to `"admin"`
4. Log in with admin credentials to access the admin dashboard

## 🔑 Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your **API keys** from Developers > API keys
3. For testing: Use **test keys** (starts with `pk_test_` and `sk_test_`)
4. For production: Use **live keys** (starts with `pk_live_` and `sk_live_`)
5. Add keys to environment variables in both backend and frontend

## 📁 Project Structure

```
heavenlynatureministry/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Backend environment variables
│   └── .env.example          # Environment template
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js      # Axios configuration
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── Navbar.js
│   │   │   └── Footer.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── About.js
│   │   │   ├── Sermons.js
│   │   │   ├── SermonDetail.js
│   │   │   ├── Events.js
│   │   │   ├── EventDetail.js
│   │   │   ├── Blog.js
│   │   │   ├── BlogDetail.js
│   │   │   ├── Donate.js
│   │   │   ├── Contact.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── AdminDashboard.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── .env                   # Frontend environment variables
│   └── .env.example          # Environment template
│
└── README.md                  # This file
```

## 🔒 Security Notes

- **Never commit `.env` files** to version control
- Change `JWT_SECRET_KEY` to a strong random string in production
- Use **live Stripe keys** only in production
- Keep MongoDB credentials secure
- Use strong passwords for admin accounts

## 📧 Contact Email Setup

The contact form currently saves submissions to the database. To enable email notifications:

1. Configure SMTP settings in backend `.env`
2. Update the contact route in `server.py` to send emails
3. Recommended: Use SendGrid or similar email service

## 🎨 Customization

### Changing Colors
Edit `/frontend/src/index.css` to modify the color scheme

### Adding Pages
1. Create new component in `/frontend/src/pages`
2. Add route in `/frontend/src/App.js`

### Modifying API
Add new endpoints in `/backend/server.py`

## 🐛 Troubleshooting

### Backend Issues
- **CORS errors**: Check `CORS_ORIGINS` in backend `.env`
- **MongoDB connection**: Verify `MONGO_URL` is correct
- **Stripe errors**: Ensure Stripe keys are properly set

### Frontend Issues
- **API calls failing**: Check `REACT_APP_BACKEND_URL` in frontend `.env`
- **Stripe not loading**: Verify `REACT_APP_STRIPE_PUBLISHABLE_KEY`
- **Build errors**: Run `yarn install` again

## 📄 License

This project is built for Heavenly Nature Ministry. All rights reserved.

## 🙏 Support

For support, email: info@heavenlynatureministry.com

---

**Built with ❤️ for the Kingdom**
# heavenlynatureministry
# heavenlynatureministry
