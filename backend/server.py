from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import stripe

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'heavenly_nature_ministry')]

# JWT Configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Stripe configuration
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI(title="Heavenly Nature Ministry API")

# Create API router
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

# User Models
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str = "user"  # user or admin
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

# Sermon Models
class SermonCreate(BaseModel):
    title: str
    speaker: str
    description: Optional[str] = None
    date: datetime
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    series: Optional[str] = None
    scripture: Optional[str] = None

class Sermon(SermonCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    views: int = 0

# Event Models
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: datetime
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    max_attendees: Optional[int] = None

class Event(EventCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    attendees_count: int = 0

class EventRSVP(BaseModel):
    event_id: str
    user_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    attendees: int = 1

# Blog Models
class BlogCreate(BaseModel):
    title: str
    content: str
    author: str
    excerpt: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []
    image_url: Optional[str] = None
    published: bool = False

class Blog(BlogCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    views: int = 0

# Donation Models
class DonationCreate(BaseModel):
    amount: float
    currency: str = "usd"
    donor_name: Optional[str] = None
    donor_email: Optional[EmailStr] = None
    message: Optional[str] = None
    recurring: bool = False

class Donation(DonationCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    payment_intent_id: Optional[str] = None
    status: str = "pending"  # pending, succeeded, failed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Contact Form Models
class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"  # new, read, replied

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone
    )
    
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token({"sub": user.id, "email": user.email})
    
    return TokenResponse(access_token=token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password'})
    token = create_access_token({"sub": user.id, "email": user.email})
    
    return TokenResponse(access_token=token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ==================== SERMON ROUTES ====================

@api_router.get("/sermons", response_model=List[Sermon])
async def get_sermons(skip: int = 0, limit: int = 50):
    sermons = await db.sermons.find({}, {"_id": 0}).sort("date", -1).skip(skip).limit(limit).to_list(limit)
    for sermon in sermons:
        if isinstance(sermon.get('date'), str):
            sermon['date'] = datetime.fromisoformat(sermon['date'])
        if isinstance(sermon.get('created_at'), str):
            sermon['created_at'] = datetime.fromisoformat(sermon['created_at'])
    return sermons

@api_router.get("/sermons/{sermon_id}", response_model=Sermon)
async def get_sermon(sermon_id: str):
    sermon = await db.sermons.find_one({"id": sermon_id}, {"_id": 0})
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    
    # Increment views
    await db.sermons.update_one({"id": sermon_id}, {"$inc": {"views": 1}})
    sermon['views'] = sermon.get('views', 0) + 1
    
    if isinstance(sermon.get('date'), str):
        sermon['date'] = datetime.fromisoformat(sermon['date'])
    if isinstance(sermon.get('created_at'), str):
        sermon['created_at'] = datetime.fromisoformat(sermon['created_at'])
    
    return sermon

@api_router.post("/sermons", response_model=Sermon)
async def create_sermon(sermon_data: SermonCreate, admin: User = Depends(get_admin_user)):
    sermon = Sermon(**sermon_data.model_dump())
    sermon_dict = sermon.model_dump()
    sermon_dict['date'] = sermon_dict['date'].isoformat()
    sermon_dict['created_at'] = sermon_dict['created_at'].isoformat()
    
    await db.sermons.insert_one(sermon_dict)
    return sermon

@api_router.put("/sermons/{sermon_id}", response_model=Sermon)
async def update_sermon(sermon_id: str, sermon_data: SermonCreate, admin: User = Depends(get_admin_user)):
    existing = await db.sermons.find_one({"id": sermon_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Sermon not found")
    
    update_data = sermon_data.model_dump()
    update_data['date'] = update_data['date'].isoformat()
    
    await db.sermons.update_one({"id": sermon_id}, {"$set": update_data})
    
    updated_sermon = await db.sermons.find_one({"id": sermon_id}, {"_id": 0})
    if isinstance(updated_sermon.get('date'), str):
        updated_sermon['date'] = datetime.fromisoformat(updated_sermon['date'])
    if isinstance(updated_sermon.get('created_at'), str):
        updated_sermon['created_at'] = datetime.fromisoformat(updated_sermon['created_at'])
    
    return Sermon(**updated_sermon)

@api_router.delete("/sermons/{sermon_id}")
async def delete_sermon(sermon_id: str, admin: User = Depends(get_admin_user)):
    result = await db.sermons.delete_one({"id": sermon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sermon not found")
    return {"message": "Sermon deleted successfully"}

# ==================== EVENT ROUTES ====================

@api_router.get("/events", response_model=List[Event])
async def get_events(upcoming: bool = True, skip: int = 0, limit: int = 50):
    query = {}
    if upcoming:
        query["date"] = {"$gte": datetime.now(timezone.utc).isoformat()}
    
    events = await db.events.find(query, {"_id": 0}).sort("date", 1).skip(skip).limit(limit).to_list(limit)
    for event in events:
        if isinstance(event.get('date'), str):
            event['date'] = datetime.fromisoformat(event['date'])
        if event.get('end_date') and isinstance(event['end_date'], str):
            event['end_date'] = datetime.fromisoformat(event['end_date'])
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
    return events

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if isinstance(event.get('date'), str):
        event['date'] = datetime.fromisoformat(event['date'])
    if event.get('end_date') and isinstance(event['end_date'], str):
        event['end_date'] = datetime.fromisoformat(event['end_date'])
    if isinstance(event.get('created_at'), str):
        event['created_at'] = datetime.fromisoformat(event['created_at'])
    
    return event

@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, admin: User = Depends(get_admin_user)):
    event = Event(**event_data.model_dump())
    event_dict = event.model_dump()
    event_dict['date'] = event_dict['date'].isoformat()
    if event_dict.get('end_date'):
        event_dict['end_date'] = event_dict['end_date'].isoformat()
    event_dict['created_at'] = event_dict['created_at'].isoformat()
    
    await db.events.insert_one(event_dict)
    return event

@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, event_data: EventCreate, admin: User = Depends(get_admin_user)):
    existing = await db.events.find_one({"id": event_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = event_data.model_dump()
    update_data['date'] = update_data['date'].isoformat()
    if update_data.get('end_date'):
        update_data['end_date'] = update_data['end_date'].isoformat()
    
    await db.events.update_one({"id": event_id}, {"$set": update_data})
    
    updated_event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if isinstance(updated_event.get('date'), str):
        updated_event['date'] = datetime.fromisoformat(updated_event['date'])
    if updated_event.get('end_date') and isinstance(updated_event['end_date'], str):
        updated_event['end_date'] = datetime.fromisoformat(updated_event['end_date'])
    if isinstance(updated_event.get('created_at'), str):
        updated_event['created_at'] = datetime.fromisoformat(updated_event['created_at'])
    
    return Event(**updated_event)

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, admin: User = Depends(get_admin_user)):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

@api_router.post("/events/{event_id}/rsvp")
async def rsvp_event(event_id: str, rsvp_data: EventRSVP):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if already registered
    existing_rsvp = await db.event_rsvps.find_one({"event_id": event_id, "email": rsvp_data.email})
    if existing_rsvp:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    rsvp_dict = rsvp_data.model_dump()
    rsvp_dict['id'] = str(uuid.uuid4())
    rsvp_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.event_rsvps.insert_one(rsvp_dict)
    await db.events.update_one({"id": event_id}, {"$inc": {"attendees_count": rsvp_data.attendees}})
    
    return {"message": "RSVP successful"}

# ==================== BLOG ROUTES ====================

@api_router.get("/blog", response_model=List[Blog])
async def get_blogs(published_only: bool = True, skip: int = 0, limit: int = 50):
    query = {"published": True} if published_only else {}
    blogs = await db.blogs.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for blog in blogs:
        if isinstance(blog.get('created_at'), str):
            blog['created_at'] = datetime.fromisoformat(blog['created_at'])
        if isinstance(blog.get('updated_at'), str):
            blog['updated_at'] = datetime.fromisoformat(blog['updated_at'])
    
    return blogs

@api_router.get("/blog/{blog_id}", response_model=Blog)
async def get_blog(blog_id: str):
    blog = await db.blogs.find_one({"id": blog_id}, {"_id": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Increment views
    await db.blogs.update_one({"id": blog_id}, {"$inc": {"views": 1}})
    blog['views'] = blog.get('views', 0) + 1
    
    if isinstance(blog.get('created_at'), str):
        blog['created_at'] = datetime.fromisoformat(blog['created_at'])
    if isinstance(blog.get('updated_at'), str):
        blog['updated_at'] = datetime.fromisoformat(blog['updated_at'])
    
    return blog

@api_router.post("/blog", response_model=Blog)
async def create_blog(blog_data: BlogCreate, admin: User = Depends(get_admin_user)):
    blog = Blog(**blog_data.model_dump())
    blog_dict = blog.model_dump()
    blog_dict['created_at'] = blog_dict['created_at'].isoformat()
    blog_dict['updated_at'] = blog_dict['updated_at'].isoformat()
    
    await db.blogs.insert_one(blog_dict)
    return blog

@api_router.put("/blog/{blog_id}", response_model=Blog)
async def update_blog(blog_id: str, blog_data: BlogCreate, admin: User = Depends(get_admin_user)):
    existing = await db.blogs.find_one({"id": blog_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    update_data = blog_data.model_dump()
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.blogs.update_one({"id": blog_id}, {"$set": update_data})
    
    updated_blog = await db.blogs.find_one({"id": blog_id}, {"_id": 0})
    if isinstance(updated_blog.get('created_at'), str):
        updated_blog['created_at'] = datetime.fromisoformat(updated_blog['created_at'])
    if isinstance(updated_blog.get('updated_at'), str):
        updated_blog['updated_at'] = datetime.fromisoformat(updated_blog['updated_at'])
    
    return Blog(**updated_blog)

@api_router.delete("/blog/{blog_id}")
async def delete_blog(blog_id: str, admin: User = Depends(get_admin_user)):
    result = await db.blogs.delete_one({"id": blog_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return {"message": "Blog post deleted successfully"}

# ==================== DONATION ROUTES ====================

@api_router.post("/donations/create-payment-intent")
async def create_payment_intent(donation_data: DonationCreate):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    try:
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(donation_data.amount * 100),  # Convert to cents
            currency=donation_data.currency,
            metadata={
                "donor_name": donation_data.donor_name or "Anonymous",
                "donor_email": donation_data.donor_email or "",
                "message": donation_data.message or ""
            }
        )
        
        # Save donation to database
        donation = Donation(**donation_data.model_dump())
        donation.payment_intent_id = intent.id
        donation_dict = donation.model_dump()
        donation_dict['created_at'] = donation_dict['created_at'].isoformat()
        
        await db.donations.insert_one(donation_dict)
        
        return {"client_secret": intent.client_secret, "donation_id": donation.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/donations/{donation_id}/confirm")
async def confirm_donation(donation_id: str, payment_intent_id: str = Body(..., embed=True)):
    donation = await db.donations.find_one({"id": donation_id})
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        status_mapping = {
            "succeeded": "succeeded",
            "processing": "pending",
            "requires_payment_method": "failed"
        }
        donation_status = status_mapping.get(intent.status, "pending")
        
        await db.donations.update_one(
            {"id": donation_id},
            {"$set": {"status": donation_status}}
        )
        
        return {"status": donation_status}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/donations", response_model=List[Donation])
async def get_donations(admin: User = Depends(get_admin_user), skip: int = 0, limit: int = 100):
    donations = await db.donations.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for donation in donations:
        if isinstance(donation.get('created_at'), str):
            donation['created_at'] = datetime.fromisoformat(donation['created_at'])
    
    return donations

# ==================== CONTACT ROUTES ====================

@api_router.post("/contact", response_model=ContactSubmission)
async def submit_contact(contact_data: ContactSubmission):
    contact_dict = contact_data.model_dump()
    contact_dict['created_at'] = contact_dict['created_at'].isoformat()
    
    await db.contact_submissions.insert_one(contact_dict)
    
    # TODO: Send email notification to info@heavenlynatureministry.com
    # This would require email service configuration (SendGrid, SMTP, etc.)
    
    return contact_data

@api_router.get("/contact", response_model=List[ContactSubmission])
async def get_contact_submissions(admin: User = Depends(get_admin_user), skip: int = 0, limit: int = 100):
    submissions = await db.contact_submissions.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for submission in submissions:
        if isinstance(submission.get('created_at'), str):
            submission['created_at'] = datetime.fromisoformat(submission['created_at'])
    
    return submissions

@api_router.put("/contact/{contact_id}/status")
async def update_contact_status(contact_id: str, status: str = Body(..., embed=True), admin: User = Depends(get_admin_user)):
    result = await db.contact_submissions.update_one(
        {"id": contact_id},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Contact submission not found")
    return {"message": "Status updated successfully"}

# ==================== STATS ROUTES ====================

@api_router.get("/stats")
async def get_stats(admin: User = Depends(get_admin_user)):
    total_users = await db.users.count_documents({})
    total_sermons = await db.sermons.count_documents({})
    total_events = await db.events.count_documents({})
    total_blogs = await db.blogs.count_documents({})
    total_donations = await db.donations.count_documents({"status": "succeeded"})
    
    # Calculate total donation amount
    donations = await db.donations.find({"status": "succeeded"}, {"_id": 0, "amount": 1}).to_list(1000)
    total_amount = sum(d.get('amount', 0) for d in donations)
    
    pending_contacts = await db.contact_submissions.count_documents({"status": "new"})
    
    return {
        "users": total_users,
        "sermons": total_sermons,
        "events": total_events,
        "blogs": total_blogs,
        "donations": total_donations,
        "donation_amount": total_amount,
        "pending_contacts": pending_contacts
    }

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "Heavenly Nature Ministry API", "status": "online"}

@api_router.get("/health")
async def health_check():
    try:
        await db.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

# ==================== APP CONFIGURATION ====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
