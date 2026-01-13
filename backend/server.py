from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import uuid
import asyncio
import resend

from models import (
    Sermon, SermonCreate, Event, EventCreate, EventRSVP, EventRSVPCreate,
    Donation, DonationCreate, PrayerRequest, PrayerRequestCreate,
    Volunteer, VolunteerCreate, BlogPost, BlogPostCreate,
    Resource, ResourceCreate, LiveStream, LiveStreamCreate, ChatMessage,
    UserCreate, UserLogin, Token, MinistryInfo, UserRole
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Heavenly Nature Ministry API", version="1.0.0")

api_router = APIRouter(prefix="/api")

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION = int(os.getenv('JWT_EXPIRATION_HOURS', 24))

STRIPE_API_KEY = os.getenv('STRIPE_API_KEY')
resend.api_key = os.getenv('RESEND_API_KEY')

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
    try:
        if not resend.api_key:
            logger.warning("Email sending skipped - RESEND_API_KEY not configured")
            return
        await asyncio.to_thread(
            resend.Emails.send,
            {
                "from": os.getenv('SENDER_EMAIL', 'info@heavenlynatureministry.com'),
                "to": [recipient],
                "subject": subject,
                "html": html_content
            }
        )
        logger.info(f"Email sent to {recipient}")
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user_data.password)
    user_dict = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "password": hashed_password,
        "full_name": user_data.full_name,
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_dict)
    
    token = create_access_token({"sub": user_dict["id"], "email": user_dict["email"]})
    return {"access_token": token, "token_type": "bearer"}

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not pwd_context.verify(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return {"access_token": token, "token_type": "bearer"}

@api_router.get("/sermons", response_model=List[Sermon])
async def get_sermons(skip: int = 0, limit: int = 20, series: Optional[str] = None):
    query = {}
    if series:
        query["series"] = series
    
    sermons = await db.sermons.find(query, {"_id": 0}).sort("date", -1).skip(skip).limit(limit).to_list(limit)
    return sermons

@api_router.get("/sermons/{sermon_id}", response_model=Sermon)
async def get_sermon(sermon_id: str):
    sermon = await db.sermons.find_one({"id": sermon_id}, {"_id": 0})
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    
    await db.sermons.update_one({"id": sermon_id}, {"$inc": {"view_count": 1}})
    return sermon

@api_router.post("/sermons", response_model=Sermon)
async def create_sermon(sermon: SermonCreate, current_user: dict = Depends(get_admin_user)):
    sermon_dict = sermon.model_dump()
    sermon_dict.update({
        "id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "view_count": 0,
        "download_count": 0
    })
    await db.sermons.insert_one(sermon_dict)
    return sermon_dict

@api_router.get("/events", response_model=List[Event])
async def get_events(skip: int = 0, limit: int = 20, upcoming: bool = True):
    query = {}
    if upcoming:
        query["start_date"] = {"$gte": datetime.now(timezone.utc).isoformat()}
    
    events = await db.events.find(query, {"_id": 0}).sort("start_date", 1).skip(skip).limit(limit).to_list(limit)
    return events

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@api_router.post("/events", response_model=Event)
async def create_event(event: EventCreate, current_user: dict = Depends(get_admin_user)):
    event_dict = event.model_dump()
    event_dict.update({
        "id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "attendees_count": 0
    })
    await db.events.insert_one(event_dict)
    return event_dict

@api_router.post("/events/{event_id}/rsvp", response_model=EventRSVP)
async def create_rsvp(event_id: str, rsvp: EventRSVPCreate, background_tasks: BackgroundTasks):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    rsvp_dict = rsvp.model_dump()
    rsvp_dict.update({
        "id": str(uuid.uuid4()),
        "status": "confirmed",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    await db.rsvps.insert_one(rsvp_dict)
    await db.events.update_one({"id": event_id}, {"$inc": {"attendees_count": rsvp.number_of_attendees}})
    
    background_tasks.add_task(
        send_email,
        rsvp.email,
        f"RSVP Confirmation - {event['title']}",
        f"<h1>Thank you for your RSVP!</h1><p>Event: {event['title']}</p><p>Date: {event['start_date']}</p>"
    )
    
    return rsvp_dict

@api_router.post("/donations/checkout", response_model=dict)
async def create_donation_checkout(donation: DonationCreate, request: Request):
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
        
        host_url = str(request.base_url)
        webhook_url = f"{host_url}api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        origin_url = request.headers.get("origin", host_url)
        success_url = f"{origin_url}/donation-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{origin_url}/donations"
        
        metadata = {
            "category": donation.category,
            "frequency": donation.frequency,
            "donor_name": donation.donor_name or "Anonymous",
            "donor_email": donation.donor_email or "",
            "anonymous": str(donation.anonymous)
        }
        
        checkout_request = CheckoutSessionRequest(
            amount=donation.amount,
            currency=donation.currency,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        donation_dict = donation.model_dump()
        donation_dict.update({
            "id": str(uuid.uuid4()),
            "stripe_session_id": session.session_id,
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        await db.donations.insert_one(donation_dict)
        
        return {"url": session.url, "session_id": session.session_id}
    except Exception as e:
        logger.error(f"Stripe checkout error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/donations/status/{session_id}")
async def get_donation_status(session_id: str):
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        status = await stripe_checkout.get_checkout_status(session_id)
        
        donation = await db.donations.find_one({"stripe_session_id": session_id}, {"_id": 0})
        if donation and donation.get("payment_status") != "paid" and status.payment_status == "paid":
            await db.donations.update_one(
                {"stripe_session_id": session_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
        
        return status.model_dump()
    except Exception as e:
        logger.error(f"Error checking donation status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        
        body = await request.body()
        signature = request.headers.get("stripe-signature")
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            await db.donations.update_one(
                {"stripe_session_id": webhook_response.session_id},
                {"$set": {"payment_status": "paid", "stripe_payment_id": webhook_response.event_id}}
            )
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/prayers", response_model=PrayerRequest)
async def create_prayer_request(prayer: PrayerRequestCreate, background_tasks: BackgroundTasks):
    prayer_dict = prayer.model_dump()
    prayer_dict.update({
        "id": str(uuid.uuid4()),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    await db.prayers.insert_one(prayer_dict)
    
    if prayer.email:
        background_tasks.add_task(
            send_email,
            prayer.email,
            "Prayer Request Received",
            "<h1>We received your prayer request</h1><p>Our prayer team will be lifting you up in prayer.</p>"
        )
    
    return prayer_dict

@api_router.get("/prayers", response_model=List[PrayerRequest])
async def get_prayers(skip: int = 0, limit: int = 20, public_only: bool = True):
    query = {}
    if public_only:
        query["public_sharing_allowed"] = True
    
    prayers = await db.prayers.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return prayers

@api_router.post("/volunteers", response_model=Volunteer)
async def create_volunteer(volunteer: VolunteerCreate, background_tasks: BackgroundTasks):
    volunteer_dict = volunteer.model_dump()
    volunteer_dict.update({
        "id": str(uuid.uuid4()),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    await db.volunteers.insert_one(volunteer_dict)
    
    background_tasks.add_task(
        send_email,
        volunteer.email,
        "Volunteer Application Received",
        f"<h1>Thank you for volunteering!</h1><p>Hi {volunteer.first_name}, we received your application.</p>"
    )
    
    return volunteer_dict

@api_router.get("/blog", response_model=List[BlogPost])
async def get_blog_posts(skip: int = 0, limit: int = 20, published_only: bool = True):
    query = {}
    if published_only:
        query["published"] = True
    
    posts = await db.blog_posts.find(query, {"_id": 0}).sort("published_at", -1).skip(skip).limit(limit).to_list(limit)
    return posts

@api_router.get("/blog/{slug}", response_model=BlogPost)
async def get_blog_post(slug: str):
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    await db.blog_posts.update_one({"slug": slug}, {"$inc": {"view_count": 1}})
    return post

@api_router.post("/blog", response_model=BlogPost)
async def create_blog_post(post: BlogPostCreate, current_user: dict = Depends(get_admin_user)):
    post_dict = post.model_dump()
    post_dict.update({
        "id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "published_at": datetime.now(timezone.utc).isoformat() if post.published else None,
        "view_count": 0
    })
    await db.blog_posts.insert_one(post_dict)
    return post_dict

@api_router.get("/resources", response_model=List[Resource])
async def get_resources(skip: int = 0, limit: int = 50, category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    
    resources = await db.resources.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    return resources

@api_router.post("/resources", response_model=Resource)
async def create_resource(resource: ResourceCreate, current_user: dict = Depends(get_admin_user)):
    resource_dict = resource.model_dump()
    resource_dict.update({
        "id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "download_count": 0
    })
    await db.resources.insert_one(resource_dict)
    return resource_dict

@api_router.get("/livestream/current")
async def get_current_livestream():
    stream = await db.livestreams.find_one({"status": "live"}, {"_id": 0})
    if not stream:
        stream = await db.livestreams.find_one(
            {"status": "scheduled", "scheduled_start": {"$gte": datetime.now(timezone.utc).isoformat()}},
            {"_id": 0}
        )
    return stream or {}

@api_router.post("/livestream", response_model=LiveStream)
async def create_livestream(stream: LiveStreamCreate, current_user: dict = Depends(get_admin_user)):
    stream_dict = stream.model_dump()
    stream_dict.update({
        "id": str(uuid.uuid4()),
        "status": "scheduled",
        "viewer_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    await db.livestreams.insert_one(stream_dict)
    return stream_dict

@api_router.get("/ministry/info", response_model=MinistryInfo)
async def get_ministry_info():
    return MinistryInfo(
        email=os.getenv("MINISTRY_EMAIL", "info@heavenlynatureministry.com"),
        phone=os.getenv("MINISTRY_PHONE", "+211922273334"),
        whatsapp=os.getenv("MINISTRY_WHATSAPP", "+211922273334"),
        address=os.getenv("MINISTRY_ADDRESS", "Gudele 2, Joppa Block 3, Juba, South Sudan"),
        latitude=float(os.getenv("MINISTRY_LOCATION_LAT", 4.8517)),
        longitude=float(os.getenv("MINISTRY_LOCATION_LNG", 31.5825))
    )

@api_router.get("/")
async def root():
    return {"message": "Heavenly Nature Ministry API", "status": "running"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
