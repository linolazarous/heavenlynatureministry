from fastapi import (
    FastAPI, APIRouter, HTTPException, Depends,
    BackgroundTasks, Request, status
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
import uuid
import asyncio
import logging
import stripe
import resend

from models import (
    Sermon, SermonCreate,
    Event, EventCreate, EventRSVP, EventRSVPCreate,
    Donation, DonationCreate,
    PrayerRequest, PrayerRequestCreate,
    Volunteer, VolunteerCreate,
    BlogPost, BlogPostCreate,
    Resource, ResourceCreate,
    LiveStream, LiveStreamCreate,
    UserCreate, UserLogin, Token,
    MinistryInfo
)

# --------------------------------------------------
# ENV + CONFIG
# --------------------------------------------------

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("heavenly-nature-api")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

JWT_SECRET = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", 24))

STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

resend.api_key = os.getenv("RESEND_API_KEY")

stripe.api_key = STRIPE_API_KEY

# --------------------------------------------------
# DATABASE
# --------------------------------------------------

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# --------------------------------------------------
# APP INIT
# --------------------------------------------------

app = FastAPI(
    title="Heavenly Nature Ministry API",
    version="1.0.0"
)

api = APIRouter(prefix="/api")

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --------------------------------------------------
# AUTH HELPERS
# --------------------------------------------------

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )
        user = await db.users.find_one({"id": payload.get("sub")}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# --------------------------------------------------
# EMAIL
# --------------------------------------------------

async def send_email(to: str, subject: str, html: str):
    if not resend.api_key:
        logger.warning("RESEND_API_KEY missing – email skipped")
        return

    await asyncio.to_thread(
        resend.Emails.send,
        {
            "from": os.getenv("SENDER_EMAIL", "info@heavenlynatureministry.com"),
            "to": [to],
            "subject": subject,
            "html": html,
        },
    )

# --------------------------------------------------
# AUTH ROUTES
# --------------------------------------------------

@api.post("/auth/register", response_model=Token)
async def register(user: UserCreate):
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(400, "Email already exists")

    hashed = pwd_context.hash(user.password)
    record = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "password": hashed,
        "full_name": user.full_name,
        "role": user.role,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(record)

    token = create_access_token({"sub": record["id"], "email": record["email"]})
    return {"access_token": token, "token_type": "bearer"}

@api.post("/auth/login", response_model=Token)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user or not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return {"access_token": token, "token_type": "bearer"}

# --------------------------------------------------
# DONATIONS – STRIPE (OFFICIAL SDK)
# --------------------------------------------------

@api.post("/donations/checkout")
async def donation_checkout(donation: DonationCreate, request: Request):
    origin = request.headers.get("origin", str(request.base_url))

    session = stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": donation.currency,
                "product_data": {
                    "name": "Heavenly Nature Ministry Donation",
                },
                "unit_amount": int(donation.amount * 100),
            },
            "quantity": 1,
        }],
        success_url=f"{origin}/donation-success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{origin}/donations",
        metadata={
            "category": donation.category,
            "frequency": donation.frequency,
            "donor_name": donation.donor_name or "Anonymous",
            "donor_email": donation.donor_email or "",
        },
    )

    await db.donations.insert_one({
        **donation.model_dump(),
        "id": str(uuid.uuid4()),
        "stripe_session_id": session.id,
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.id}

@api.get("/donations/status/{session_id}")
async def donation_status(session_id: str):
    session = stripe.checkout.Session.retrieve(session_id)

    if session.payment_status == "paid":
        await db.donations.update_one(
            {"stripe_session_id": session_id},
            {"$set": {
                "payment_status": "paid",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )

    return {
        "payment_status": session.payment_status,
        "amount_total": session.amount_total,
        "currency": session.currency,
    }

@api.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature")

    event = stripe.Webhook.construct_event(
        payload, sig, STRIPE_WEBHOOK_SECRET
    )

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        await db.donations.update_one(
            {"stripe_session_id": session["id"]},
            {"$set": {
                "payment_status": "paid",
                "stripe_payment_id": session.get("payment_intent"),
            }},
        )

    return {"status": "ok"}

# --------------------------------------------------
# MINISTRY INFO
# --------------------------------------------------

@api.get("/ministry/info", response_model=MinistryInfo)
async def ministry_info():
    return MinistryInfo(
        email=os.getenv("MINISTRY_EMAIL"),
        phone=os.getenv("MINISTRY_PHONE"),
        whatsapp=os.getenv("MINISTRY_WHATSAPP"),
        address=os.getenv("MINISTRY_ADDRESS"),
        latitude=float(os.getenv("MINISTRY_LOCATION_LAT", 0)),
        longitude=float(os.getenv("MINISTRY_LOCATION_LNG", 0)),
    )

# --------------------------------------------------
# SYSTEM
# --------------------------------------------------

@api.get("/")
async def root():
    return {"status": "running", "service": "Heavenly Nature Ministry API"}

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

@app.on_event("shutdown")
async def shutdown():
    client.close()
