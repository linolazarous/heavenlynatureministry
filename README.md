# Heavenly Nature Ministry Website

**Slogan:** "We are one" (John 17:22)

A comprehensive full-stack ministry website serving street children, abandoned children, and orphans in South Sudan.

## 🌟 Features Implemented

### Core Pages
- ✅ **Home**: Hero section, mission cards, featured sermon, upcoming events, donation CTA
- ✅ **About**: Vision, mission, SEE HIM values, goals, objectives
- ✅ **Sermons**: Audio/video library with downloadable content
- ✅ **Events**: Calendar, RSVP system with email confirmations
- ✅ **Donations**: Stripe integration, bank transfer, WhatsApp inquiry, recurring donations
- ✅ **Children's Ministry**: Programs, impact, focus areas
- ✅ **Blog/Podcast**: Teachings and articles
- ✅ **Live Streaming**: Sunday service streaming (integration ready)
- ✅ **Prayer Requests**: Public/anonymous submission with prayer team assignment
- ✅ **Resources**: Downloadable Bible study materials
- ✅ **Volunteer**: Application form with areas of interest

### Technical Features
- ✅ **Authentication**: JWT-based auth for admin users
- ✅ **Payment Processing**: Stripe Checkout with webhook handling
- ✅ **Email Notifications**: Resend integration for donation receipts, RSVP confirmations
- ✅ **MongoDB Database**: Optimized schemas with proper indexing
- ✅ **Responsive Design**: Mobile-first, optimized for low bandwidth
- ✅ **Design System**: Custom Tailwind theme with ministry branding

## 🎨 Design

**Theme**: "Grounded Royal" - Light-first with earth tones
**Colors**:
- Primary: Deep Blue (#1E3A8A) - Spiritual depth
- Accent: Royal Gold (#D4AF37) - Excellence
- Secondary: Sand/Beige (#E5E0D8) - Grounding

**Typography**:
- Headings: Playfair Display (Serif) - Royal, trustworthy
- Body: Manrope (Sans-serif) - Modern, readable

## 🛠️ Tech Stack

### Frontend
- React 19
- React Router 7
- Tailwind CSS with custom theme
- shadcn/ui components
- Lucide React icons
- Sonner for toasts

### Backend
- FastAPI
- Motor (Async MongoDB driver)
- Pydantic for validation
- JWT authentication
- Stripe integration (emergentintegrations)
- Resend for email

### Database
- MongoDB with optimized schemas
- Collections: sermons, events, donations, prayers, volunteers, blog_posts, resources, livestreams, users

## 🔐 Environment Variables Setup

### Backend API Keys Needed:
1. **RESEND_API_KEY** - For email notifications (donation receipts, RSVP confirmations)
2. **YOUTUBE_API_KEY, YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET** - For live streaming
3. **GOOGLE_MAPS_API_KEY** - For event location maps
4. **SMTP credentials** (if using Zoho mail instead of Resend)

### Stripe Integration
- Test key (sk_test_emergent) is already configured
- Replace with production key when going live

## 📱 Mobile Optimization

- Mobile-first responsive design
- Low bandwidth optimization (CSS effects over heavy images)
- Lazy loading for non-critical assets
- Optimized images (WebP format)
- Fast loading times (Target: FCP < 1.5s)

## 🎯 Next Action Items

### 1. API Keys Configuration
Add the following to `/app/backend/.env`:
- RESEND_API_KEY for email notifications
- YouTube API credentials for live streaming
- GOOGLE_MAPS_API_KEY for event maps
- Or SMTP credentials for Zoho mail

### 2. Content Population
- Add sermons (upload audio/video files)
- Create upcoming events
- Write blog posts
- Upload resource materials (Bible studies, teachings)
- Schedule livestreams

### 3. Admin Account Setup
- Register admin account via POST /api/auth/register
- Use credentials to manage content via admin endpoints

### 4. Testing with Real Data
- Test donation flow with Stripe
- Test RSVP system with event creation
- Test prayer request submissions
- Test volunteer applications

## 💡 Potential Enhancements

**Would you like to add:**
- **Analytics Dashboard**: Track donations, attendance, engagement metrics
- **Multi-language Support**: Add local languages for South Sudan context
- **SMS Notifications**: Twilio integration for event reminders
- **Photo Gallery**: Showcase ministry work and success stories
- **Testimonial System**: Collect and display impact stories

---

*"For I have given them the glory that you gave me, that they may be one as we are one" - John 17:22*
