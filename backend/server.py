# backend/server.py

from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import JWTError, jwt
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional
import os
import uuid
import logging
import asyncio
import resend
import smtplib
from email.mime.text import MIMEText

from models import (
    Sermon, SermonCreate, Event, EventCreate, EventRSVP, EventRSVPCreate,
    Donation, DonationCreate, PrayerRequest, PrayerRequestCreate,
    Volunteer, VolunteerCreate, BlogPost, BlogPostCreate,
    Resource, ResourceCreate, LiveStream, LiveStreamCreate, ChatMessage,
    UserCreate, UserLogin, Token, MinistryInfo, UserRole
)

# -------------------------------
# Load environment variables
# -------------------------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# App & router
app = FastAPI(title="Heavenly Nature Ministry API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Auth & JWT
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'heavenly-nature-ministry-secret-key-change-in-production')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION = int(os.getenv('JWT_EXPIRATION_HOURS', 24))

# Stripe
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Resend / SMTP
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
resend.api_key = RESEND_API_KEY
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "info@heavenlynatureministry.com")
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_NAME = os.getenv("FROM_NAME", "Heavenly Nature Ministry")

# Ministry info
MINISTRY_EMAIL = os.getenv("MINISTRY_EMAIL", "info@heavenlynatureministry.com")
MINISTRY_PHONE = os.getenv("MINISTRY_PHONE", "+211922273334")
MINISTRY_WHATSAPP = os.getenv("MINISTRY_WHATSAPP", "+211922273334")
MINISTRY_ADDRESS = os.getenv("MINISTRY_ADDRESS", "Gudele 2, Joppa Block 3, Juba, South Sudan")
MINISTRY_LAT = float(os.getenv("MINISTRY_LOCATION_LAT", 4.8517))
MINISTRY_LNG = float(os.getenv("MINISTRY_LOCATION_LNG", 31.5825))

# -------------------------------
# Helper functions
# -------------------------------

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


async def send_email(recipient: str, subject: str, html_content: str):
    # Try Resend first
    try:
        if RESEND_API_KEY:
            await asyncio.to_thread(
                resend.Emails.send,
                {
                    "from": SENDER_EMAIL,
                    "to": [recipient],
                    "subject": subject,
                    "html": html_content
                }
            )
            logger.info(f"Email sent to {recipient} via Resend API")
            return
    except Exception as e:
        logger.error(f"Resend API failed: {str(e)}")

    # Fallback to SMTP
    try:
        if SMTP_HOST and SMTP_USERNAME and SMTP_PASSWORD:
            msg = MIMEText(html_content, "html")
            msg['Subject'] = subject
            msg['From'] = f"{FROM_NAME} <{SMTP_USERNAME}>"
            msg['To'] = recipient

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.sendmail(SMTP_USERNAME, recipient, msg.as_string())
                logger.info(f"Email sent to {recipient} via SMTP")
    except Exception as e:
        logger.error(f"SMTP email failed: {str(e)}")


# -------------------------------
# Startup: Auto-create admin user
# -------------------------------
@app.on_event("startup")
async def create_admin_user():
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    admin_username = os.getenv("ADMIN_USERNAME", "Admin")
    if not await db.users.find_one({"email": admin_email}):
        hashed = pwd_context.hash(admin_password)
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password": hashed,
            "full_name": admin_username,
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("Admin user created")


# -------------------------------
# Root endpoint
# -------------------------------
@api_router.get("/")
async def root():
    return {"message": "Heavenly Nature Ministry API", "status": "running"}


# -------------------------------
# Ministry info
# -------------------------------
@api_router.get("/ministry/info", response_model=MinistryInfo)
async def get_ministry_info():
    return MinistryInfo(
        email=MINISTRY_EMAIL,
        phone=MINISTRY_PHONE,
        whatsapp=MINISTRY_WHATSAPP,
        address=MINISTRY_ADDRESS,
        latitude=MINISTRY_LAT,
        longitude=MINISTRY_LNG
    )


# -------------------------------
# Placeholder for YouTube/Facebook/RTMP/WebRTC
# -------------------------------
# These can be extended with actual livestream or video upload integration
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
FACEBOOK_PAGE_ACCESS_TOKEN = os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN")
RTMP_SERVER_URL = os.getenv("RTMP_SERVER_URL")
WEBRTC_SERVER_URL = os.getenv("WEBRTC_SERVER_URL")


# -------------------------------
# Include other routers
# -------------------------------
# Here you would include your existing routes (sermons, events, donations, prayers, volunteers, blog, resources, livestream)
# For brevity, assume all routes are imported and added below
# e.g., app.include_router(sermon_router)
# In your original code, all routes were defined in api_router
app.include_router(api_router)


# -------------------------------
# CORS Middleware
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.getenv('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# Shutdown
# -------------------------------
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
