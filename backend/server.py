from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Body, Response, Request, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import stripe
import asyncio
from email_validator import validate_email, EmailNotValidError
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from starlette.middleware.base import BaseHTTPMiddleware

# ==================== CONFIGURATION ====================

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB Atlas Configuration
MONGO_URL = os.environ.get('MONGO_URL')
if not MONGO_URL:
    raise ValueError("❌ MONGO_URL environment variable is required for MongoDB Atlas")

DB_NAME = os.environ.get('DB_NAME', 'heavenly_nature_ministry')

# Security Configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
if not JWT_SECRET_KEY or JWT_SECRET_KEY == 'your-secret-key-change-in-production':
    raise ValueError("❌ JWT_SECRET_KEY must be set to a secure value in production")
    
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', "HS256")
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', 24))

# Admin Configuration
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD')
if not ADMIN_PASSWORD:
    raise ValueError("❌ ADMIN_PASSWORD must be set in environment variables")
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'info@heavenlynatureministry.com')

# Stripe Configuration
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
stripe.api_key = STRIPE_SECRET_KEY if STRIPE_SECRET_KEY else None

# Email Configuration
SMTP_HOST = os.environ.get('SMTP_HOST')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USERNAME = os.environ.get('SMTP_USERNAME')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'info@heavenlynatureministry.com')
FROM_NAME = os.environ.get('FROM_NAME', 'Heavenly Nature Ministry')

# Environment
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'production')
IS_PRODUCTION = ENVIRONMENT == 'production'

# Render-specific configuration
RENDER = os.environ.get('RENDER', 'false').lower() == 'true'
RENDER_EXTERNAL_URL = os.environ.get('RENDER_EXTERNAL_URL', '')

# ==================== DATABASE CONNECTION ====================

# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)

# MongoDB Atlas connection - Production optimized
class MongoDBAtlas:
    _client: Optional[AsyncIOMotorClient] = None
    _db = None
    
    @classmethod
    async def get_client(cls) -> AsyncIOMotorClient:
        """Get MongoDB Atlas client with connection pooling and retry logic"""
        if cls._client is None:
            max_retries = 5
            base_delay = 1  # seconds
            
            for attempt in range(max_retries):
                try:
                    logging.info(f"🔗 MongoDB Atlas connection attempt {attempt + 1}/{max_retries}")
                    
                    # MongoDB Atlas optimized connection
                    cls._client = AsyncIOMotorClient(
                        MONGO_URL,
                        maxPoolSize=100,
                        minPoolSize=10,
                        maxIdleTimeMS=30000,
                        waitQueueTimeoutMS=10000,
                        serverSelectionTimeoutMS=15000,
                        connectTimeoutMS=10000,
                        socketTimeoutMS=30000,
                        retryWrites=True,
                        retryReads=True,
                        appname="HeavenlyNatureMinistryAPI",
                        compressors="snappy,zlib" if IS_PRODUCTION else None
                    )
                    
                    # Test connection with immediate timeout
                    await asyncio.wait_for(
                        cls._client.admin.command('ping'),
                        timeout=5
                    )
                    
                    logging.info("✅ MongoDB Atlas connection established")
                    cls._db = cls._client[DB_NAME]
                    
                    # Verify database access
                    collections = await cls._db.list_collection_names()
                    logging.info(f"📁 Database '{DB_NAME}' has {len(collections)} collection(s)")
                    
                    return cls._client
                    
                except asyncio.TimeoutError:
                    logging.warning(f"⏱️ MongoDB connection timeout (attempt {attempt + 1})")
                except Exception as e:
                    error_msg = str(e)
                    logging.error(f"❌ MongoDB connection failed (attempt {attempt + 1}): {error_msg}")
                    
                    if "bad auth" in error_msg.lower():
                        logging.error("🔐 Authentication failed. Check MongoDB Atlas credentials.")
                    elif "network error" in error_msg.lower():
                        logging.error("🌐 Network error. Check IP whitelist in MongoDB Atlas.")
                    elif "querySrv" in error_msg or "DNS" in error_msg:
                        logging.error("🔗 DNS resolution failed. Check connection string format.")
                    
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    logging.info(f"⏳ Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)
            
            raise HTTPException(
                status_code=500,
                detail="Failed to connect to MongoDB Atlas after multiple attempts."
            )
        
        return cls._client
    
    @classmethod
    async def get_database(cls):
        """Get database instance"""
        if cls._db is None:
            await cls.get_client()
        return cls._db
    
    @classmethod
    async def close(cls):
        """Close database connection"""
        if cls._client:
            cls._client.close()
            cls._client = None
            cls._db = None
            logging.info("🔒 MongoDB connection closed")

# Create indexes on startup
async def create_indexes():
    """Create database indexes with error handling"""
    try:
        database = await MongoDBAtlas.get_database()
        
        # Users indexes
        await database.users.create_index("email", unique=True)
        await database.users.create_index("created_at")
        await database.users.create_index("is_active")
        
        # Admin users indexes
        await database.admin_users.create_index("username", unique=True)
        await database.admin_users.create_index("email", unique=True)
        await database.admin_users.create_index("is_active")
        
        # User sessions indexes
        await database.user_sessions.create_index("session_token", unique=True)
        await database.user_sessions.create_index([("expires_at", 1)], expireAfterSeconds=0)
        await database.user_sessions.create_index("user_id")
        await database.user_sessions.create_index("created_at")
        
        # Sermons indexes
        await database.sermons.create_index("date")
        await database.sermons.create_index("created_at")
        await database.sermons.create_index("speaker")
        await database.sermons.create_index("series")
        await database.sermons.create_index([("views", -1)])
        
        # Events indexes
        await database.events.create_index("date")
        await database.events.create_index("created_at")
        await database.events.create_index("category")
        await database.events.create_index("registration_open")
        await database.events.create_index([("date", 1), ("registration_open", 1)])
        
        # Event RSVPs indexes
        await database.event_rsvps.create_index("event_id")
        await database.event_rsvps.create_index("email")
        await database.event_rsvps.create_index("created_at")
        await database.event_rsvps.create_index([("event_id", 1), ("email", 1)], unique=True)
        
        # Blogs indexes
        await database.blogs.create_index("created_at")
        await database.blogs.create_index("published")
        await database.blogs.create_index("category")
        await database.blogs.create_index("featured")
        await database.blogs.create_index("tags")
        await database.blogs.create_index([("published", 1), ("created_at", -1)])
        
        # Donations indexes
        await database.donations.create_index("created_at")
        await database.donations.create_index("status")
        await database.donations.create_index("payment_intent_id", unique=True)
        await database.donations.create_index("donor_email")
        await database.donations.create_index([("status", 1), ("created_at", -1)])
        
        # Contact submissions indexes
        await database.contact_submissions.create_index("created_at")
        await database.contact_submissions.create_index("status")
        await database.contact_submissions.create_index("email")
        await database.contact_submissions.create_index([("status", 1), ("created_at", -1)])
        
        # Activity logs indexes
        await database.activity_logs.create_index("created_at")
        await database.activity_logs.create_index("user_id")
        await database.activity_logs.create_index("action")
        
        # Failed login attempts indexes
        await database.failed_login_attempts.create_index("created_at", expireAfterSeconds=900)
        await database.failed_login_attempts.create_index("ip_address")
        await database.failed_login_attempts.create_index([("ip_address", 1), ("created_at", -1)])
        
        logging.info("✅ Database indexes created/verified")
        
    except Exception as e:
        logging.error(f"❌ Error creating database indexes: {str(e)}")

# Security
security = HTTPBearer(auto_error=False)

# ==================== CUSTOM MIDDLEWARE FOR REDOC ====================

class RedocSecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        
        # Relax CSP for ReDoc to allow external scripts
        if request.url.path in ["/redoc", "/docs"]:
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://cdn.redoc.ly; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com; "
                "font-src 'self' https://fonts.gstatic.com data:; "
                "img-src 'self' data: https:; "
                "connect-src 'self';"
            )
        else:
            # Standard CSP for other endpoints
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:;"
            )
        
        # Additional security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response

# ==================== FASTAPI APP SETUP ====================

# Create the main app with enhanced configuration for ReDoc
app = FastAPI(
    title="Heavenly Nature Ministry API",
    description="Backend API for Heavenly Nature Ministry - Production Ready",
    version="2.0.0",
    docs_url="/docs",  # Always show docs
    redoc_url="/redoc",  # Always show redoc
    openapi_url="/openapi.json",  # Always show openapi
    contact={
        "name": "Heavenly Nature Ministry Support",
        "email": "info@heavenlynatureministry.com",
        "url": "https://heavenlynatureministry.com"
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    servers=[
        {
            "url": "https://hnmbackend-gedp.onrender.com",
            "description": "Production server"
        },
        {
            "url": "http://localhost:8000",
            "description": "Development server"
        }
    ]
)

# Create API router
api_router = APIRouter(prefix="/api")

# ==================== DATA MODELS ====================

# Base models with validation
class BaseMongoModel(BaseModel):
    class Config:
        extra = "ignore"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Admin Models
class AdminUser(BaseMongoModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    picture: Optional[str] = None
    hashed_password: str
    is_active: bool = True
    last_login: Optional[datetime] = None
    role: str = Field("admin", regex="^(admin|super_admin)$")
    permissions: List[str] = Field(default=["read", "write", "delete"])

class AdminUserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=12)

class UserSession(BaseMongoModel):
    user_id: str
    session_token: str
    expires_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    is_active: bool = True

# User Models
class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = None
    
    @validator('phone')
    def validate_phone(cls, v):
        if v and not re.match(r'^\+?1?\d{9,15}$', v):
            raise ValueError('Invalid phone number format')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one number')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    class Config:
        extra = "ignore"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str = "user"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    email_verified: bool = False
    last_login: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: User

# Sermon Models
class SermonCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    speaker: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    date: datetime
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    series: Optional[str] = None
    scripture: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, ge=1)
    
    @validator('audio_url', 'video_url', 'thumbnail_url')
    def validate_url(cls, v):
        if v and not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        return v

class Sermon(SermonCreate, BaseMongoModel):
    views: int = 0
    downloads: int = 0
    featured: bool = False

# Event Models
class EventCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    date: datetime
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    max_attendees: Optional[int] = Field(None, gt=0)
    registration_required: bool = False
    
    @validator('end_date')
    def validate_end_date(cls, v, values):
        if v and 'date' in values and v < values['date']:
            raise ValueError('End date must be after start date')
        return v

class Event(EventCreate, BaseMongoModel):
    attendees_count: int = 0
    registration_open: bool = True
    featured: bool = False

class EventRSVP(BaseModel):
    event_id: str
    user_id: Optional[str] = None
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    attendees: int = Field(1, gt=0, le=10)
    notes: Optional[str] = None
    
    @validator('phone')
    def validate_phone(cls, v):
        if v and not re.match(r'^\+?1?\d{9,15}$', v):
            raise ValueError('Invalid phone number format')
        return v

# Blog Models
class BlogCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=10)
    author: str = Field(..., min_length=2, max_length=100)
    excerpt: Optional[str] = Field(None, max_length=300)
    category: Optional[str] = None
    tags: List[str] = []
    image_url: Optional[str] = None
    published: bool = False
    featured: bool = False
    
    @validator('tags')
    def validate_tags(cls, v):
        if len(v) > 10:
            raise ValueError('Maximum 10 tags allowed')
        return v

class Blog(BlogCreate, BaseMongoModel):
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    views: int = 0
    likes: int = 0
    comments_count: int = 0

# Donation Models
class DonationCreate(BaseModel):
    amount: float = Field(..., gt=0)
    currency: str = Field("usd", regex="^(usd|eur|gbp|cad|aud)$")
    donor_name: Optional[str] = Field(None, min_length=2, max_length=100)
    donor_email: Optional[EmailStr] = None
    message: Optional[str] = Field(None, max_length=500)
    recurring: bool = False
    anonymous: bool = False

class Donation(DonationCreate, BaseMongoModel):
    payment_intent_id: Optional[str] = None
    status: str = Field("pending", regex="^(pending|succeeded|failed|cancelled|refunded)$")
    receipt_sent: bool = False
    receipt_url: Optional[str] = None

# Contact Form Models
class ContactSubmission(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    subject: str = Field(..., min_length=3, max_length=200)
    message: str = Field(..., min_length=10, max_length=2000)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = Field("new", regex="^(new|read|replied|archived)$")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    @validator('phone')
    def validate_phone(cls, v):
        if v and not re.match(r'^\+?1?\d{9,15}$', v):
            raise ValueError('Invalid phone number format')
        return v

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
        "jti": str(uuid.uuid4())
    })
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    database = await MongoDBAtlas.get_database()
    user_doc = await database.users.find_one({"id": user_id, "is_active": True}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    return User(**user_doc)

async def verify_admin_session(request: Request) -> Dict[str, Any]:
    session_token = None
    
    session_token = request.cookies.get("admin_session")
    
    if not session_token and request.headers.get("Authorization"):
        auth_header = request.headers.get("Authorization")
        if auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Session token required")
    
    database = await MongoDBAtlas.get_database()
    session = await database.user_sessions.find_one(
        {"session_token": session_token, "is_active": True},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    if isinstance(session.get('expires_at'), str):
        expires_at = datetime.fromisoformat(session['expires_at'].replace('Z', '+00:00'))
    else:
        expires_at = session['expires_at']
    
    if datetime.now(timezone.utc) > expires_at:
        await database.user_sessions.update_one(
            {"session_token": session_token},
            {"$set": {"is_active": False}}
        )
        raise HTTPException(status_code=401, detail="Session expired")
    
    user = await database.admin_users.find_one(
        {"id": session['user_id'], "is_active": True},
        {"_id": 0, "hashed_password": 0}
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    new_expiry = datetime.now(timezone.utc) + timedelta(days=1)
    await database.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {"expires_at": new_expiry}}
    )
    
    return {"session": session, "user": user}

async def get_current_admin(request: Request) -> Dict[str, Any]:
    return await verify_admin_session(request)

def validate_email_address(email: str) -> bool:
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False

async def log_activity(user_id: str, action: str, details: Dict[str, Any] = None, request: Request = None):
    try:
        database = await MongoDBAtlas.get_database()
        log_entry = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "action": action,
            "details": details or {},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "ip_address": request.client.host if request and request.client else None,
            "user_agent": request.headers.get("user-agent") if request else None
        }
        await database.activity_logs.insert_one(log_entry)
    except Exception as e:
        logging.error(f"Failed to log activity: {str(e)}")

async def send_email(to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
    if not all([SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD]):
        logging.warning("Email configuration not set. Skipping email send.")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f'{FROM_NAME} <{FROM_EMAIL}>'
        msg['To'] = to_email
        msg['Reply-To'] = FROM_EMAIL
        msg['Date'] = datetime.now().strftime("%a, %d %b %Y %H:%M:%S %z")
        
        if text_content:
            part1 = MIMEText(text_content, 'plain', 'utf-8')
            msg.attach(part1)
        
        part2 = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(part2)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        logging.info(f"✅ Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logging.error(f"❌ Failed to send email to {to_email}: {str(e)}")
        return False

async def send_contact_notification(contact_data: ContactSubmission):
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0; }}
            .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
            .field {{ margin-bottom: 15px; }}
            .label {{ font-weight: bold; color: #555; }}
            .value {{ color: #333; }}
            .footer {{ margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 12px; color: #777; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>📧 New Contact Form Submission</h2>
            </div>
            <div class="content">
                <div class="field">
                    <div class="label">Name:</div>
                    <div class="value">{contact_data.name}</div>
                </div>
                <div class="field">
                    <div class="label">Email:</div>
                    <div class="value"><a href="mailto:{contact_data.email}">{contact_data.email}</a></div>
                </div>
                <div class="field">
                    <div class="label">Phone:</div>
                    <div class="value">{contact_data.phone or 'Not provided'}</div>
                </div>
                <div class="field">
                    <div class="label">Subject:</div>
                    <div class="value">{contact_data.subject}</div>
                </div>
                <div class="field">
                    <div class="label">Message:</div>
                    <div class="value" style="white-space: pre-wrap;">{contact_data.message}</div>
                </div>
            </div>
            <div class="footer">
                <p>Submitted on: {contact_data.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
                <p>📞 Please respond within 24 hours.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    NEW CONTACT FORM SUBMISSION
    ===========================
    
    Name: {contact_data.name}
    Email: {contact_data.email}
    Phone: {contact_data.phone or 'Not provided'}
    Subject: {contact_data.subject}
    
    Message:
    {contact_data.message}
    
    ---------------------------
    Submitted on: {contact_data.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}
    Please respond within 24 hours.
    """
    
    await send_email(
        to_email=FROM_EMAIL,
        subject=f"📧 New Contact: {contact_data.subject[:50]}",
        html_content=html_content,
        text_content=text_content
    )

# ==================== MAIN ROOT ENDPOINT ====================

@app.get("/")
async def main_root():
    """Main application root endpoint"""
    return {
        "message": "Heavenly Nature Ministry API",
        "description": "Welcome to Heavenly Nature Ministry - Production Ready Backend Service",
        "status": "online",
        "version": "2.0.0",
        "environment": ENVIRONMENT,
        "api_base": "/api",
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json"
        },
        "health_check": "/api/health",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ==================== CUSTOM REDOC ENDPOINT ====================

@app.get("/redoc", include_in_schema=False)
async def custom_redoc():
    """Custom ReDoc endpoint with proper CSP for Render"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Heavenly Nature Ministry API - ReDoc</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Heavenly Nature Ministry API Documentation">
        <!-- ReDoc doesn't work well with strict CSP, so we relax it for this page -->
        <meta http-equiv="Content-Security-Policy" content="
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com;
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            font-src 'self' https://fonts.gstatic.com data:;
            img-src 'self' data: https:;
            connect-src 'self';
        ">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
            }
        </style>
    </head>
    <body>
        <redoc spec-url='/openapi.json'></redoc>
        <!-- Using CDN version that works well with Render -->
        <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
    </body>
    </html>
    """
    return Response(content=html_content, media_type="text/html")

# ==================== AUTH ROUTES ====================

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)

@api_router.post("/auth/admin/login", response_model=Dict[str, Any])
async def admin_login(
    login_data: LoginRequest,
    response: Response,
    request: Request,
    background_tasks: BackgroundTasks
):
    database = await MongoDBAtlas.get_database()
    
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "")
    
    failed_attempts = await database.failed_login_attempts.count_documents({
        "ip_address": ip_address,
        "created_at": {"$gt": datetime.now(timezone.utc) - timedelta(minutes=15)}
    })
    
    if failed_attempts >= 10:
        raise HTTPException(
            status_code=429, 
            detail="Too many login attempts. Please try again in 15 minutes."
        )
    
    user_doc = await database.admin_users.find_one(
        {"username": login_data.username, "is_active": True},
        {"_id": 0}
    )
    
    if not user_doc:
        await database.failed_login_attempts.insert_one({
            "id": str(uuid.uuid4()),
            "username": login_data.username,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if not verify_password(login_data.password, user_doc['hashed_password']):
        await database.failed_login_attempts.insert_one({
            "id": str(uuid.uuid4()),
            "username": login_data.username,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    await database.failed_login_attempts.delete_many({"ip_address": ip_address})
    
    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=1)
    
    new_session = UserSession(
        user_id=user_doc['id'],
        session_token=session_token,
        expires_at=expires_at,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    # FIXED: Use .dict() instead of .model_dump() for Pydantic v1
    session_dict = new_session.dict()
    session_dict['created_at'] = session_dict['created_at'].isoformat()
    session_dict['expires_at'] = session_dict['expires_at'].isoformat()
    
    await database.user_sessions.insert_one(session_dict)
    
    await database.admin_users.update_one(
        {"id": user_doc['id']},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    secure_cookie = IS_PRODUCTION
    response.set_cookie(
        key="admin_session",
        value=session_token,
        httponly=True,
        secure=secure_cookie,
        samesite="strict",
        max_age=24 * 60 * 60,
        path="/api"
    )
    
    background_tasks.add_task(log_activity, user_doc['id'], "admin_login", {
        "ip_address": ip_address,
        "user_agent": user_agent[:100]
    }, request)
    
    return {
        "success": True,
        "user_id": user_doc['id'],
        "username": user_doc['username'],
        "email": user_doc['email'],
        "name": user_doc['name'],
        "role": user_doc.get('role', 'admin'),
        "permissions": user_doc.get('permissions', []),
        "session_expires": expires_at.isoformat()
    }

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate, request: Request, background_tasks: BackgroundTasks):
    database = await MongoDBAtlas.get_database()
    
    if not validate_email_address(user_data.email):
        raise HTTPException(status_code=400, detail="Invalid email address")
    
    existing_user = await database.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(**user_data.dict(exclude={'password'}))
    
    # FIXED: Use .dict() instead of .model_dump()
    user_dict = user.dict()
    user_dict['hashed_password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    user_dict['updated_at'] = user_dict['updated_at'].isoformat()
    
    await database.users.insert_one(user_dict)
    
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    
    background_tasks.add_task(log_activity, user.id, "user_registration", {
        "email": user.email
    }, request)
    
    return TokenResponse(
        access_token=token,
        expires_in=JWT_EXPIRATION_HOURS * 3600,
        user=user
    )

@api_router.post("/auth/user-login", response_model=TokenResponse)
async def user_login(
    credentials: UserLogin,
    request: Request,
    background_tasks: BackgroundTasks
):
    database = await MongoDBAtlas.get_database()
    
    ip_address = request.client.host if request.client else "unknown"
    
    failed_attempts = await database.failed_login_attempts.count_documents({
        "email": credentials.email,
        "created_at": {"$gt": datetime.now(timezone.utc) - timedelta(minutes=15)}
    })
    
    if failed_attempts >= 5:
        raise HTTPException(status_code=429, detail="Too many login attempts. Please try again later.")
    
    user_doc = await database.users.find_one({"email": credentials.email, "is_active": True}, {"_id": 0})
    if not user_doc:
        await database.failed_login_attempts.insert_one({
            "id": str(uuid.uuid4()),
            "email": credentials.email,
            "ip_address": ip_address,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc.get('hashed_password', '')):
        await database.failed_login_attempts.insert_one({
            "id": str(uuid.uuid4()),
            "email": credentials.email,
            "ip_address": ip_address,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    await database.failed_login_attempts.delete_many({"email": credentials.email})
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'hashed_password'})
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    
    await database.users.update_one(
        {"id": user.id},
        {"$set": {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "last_login": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    background_tasks.add_task(log_activity, user.id, "user_login", {
        "ip_address": ip_address
    }, request)
    
    return TokenResponse(
        access_token=token,
        expires_in=JWT_EXPIRATION_HOURS * 3600,
        user=user
    )

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/logout")
async def logout(response: Response, request: Request):
    database = await MongoDBAtlas.get_database()
    session_token = request.cookies.get("admin_session")
    
    if session_token:
        await database.user_sessions.update_one(
            {"session_token": session_token},
            {"$set": {"is_active": False, "logged_out_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    response.delete_cookie(
        key="admin_session",
        path="/api"
    )
    return {"message": "Logged out successfully"}

@api_router.get("/auth/check")
async def check_auth(request: Request):
    try:
        auth_data = await verify_admin_session(request)
        return {
            "authenticated": True,
            "user": {
                "id": auth_data["user"]["id"],
                "username": auth_data["user"]["username"],
                "email": auth_data["user"]["email"],
                "name": auth_data["user"]["name"],
                "role": auth_data["user"].get("role", "admin"),
                "permissions": auth_data["user"].get("permissions", [])
            }
        }
    except HTTPException:
        return {"authenticated": False}

@api_router.post("/auth/refresh")
async def refresh_token(request: Request):
    database = await MongoDBAtlas.get_database()
    
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization[7:]
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_doc = await database.users.find_one({"id": user_id, "is_active": True}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")
        
        new_token = create_access_token({
            "sub": user_id,
            "email": payload.get("email"),
            "role": payload.get("role", "user")
        })
        
        return {"access_token": new_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== ADMIN INITIALIZATION ====================

async def initialize_admin_user():
    database = await MongoDBAtlas.get_database()
    
    admin_user = await database.admin_users.find_one({"username": ADMIN_USERNAME})
    
    if not admin_user:
        hashed_password = hash_password(ADMIN_PASSWORD)
        admin_user = AdminUser(
            username=ADMIN_USERNAME,
            email=ADMIN_EMAIL,
            name="Heavenly Nature Administrator",
            hashed_password=hashed_password,
            role="super_admin",
            permissions=["read", "write", "delete", "admin", "users", "content", "finance"]
        )
        
        # FIXED: Use .dict() instead of .model_dump()
        admin_dict = admin_user.dict()
        admin_dict['created_at'] = admin_dict['created_at'].isoformat()
        
        await database.admin_users.insert_one(admin_dict)
        logging.info(f"✅ Admin user '{ADMIN_USERNAME}' created successfully")
    else:
        if not verify_password(ADMIN_PASSWORD, admin_user.get('hashed_password', '')):
            hashed_password = hash_password(ADMIN_PASSWORD)
            await database.admin_users.update_one(
                {"username": ADMIN_USERNAME},
                {"$set": {"hashed_password": hashed_password}}
            )
            logging.info(f"🔄 Admin user '{ADMIN_USERNAME}' password updated")
        else:
            logging.info(f"✅ Admin user '{ADMIN_USERNAME}' already exists and is active")

# ==================== SERMON ROUTES ====================

@api_router.get("/sermons", response_model=List[Sermon])
async def get_sermons(
    skip: int = 0,
    limit: int = 20,
    series: Optional[str] = None,
    speaker: Optional[str] = None,
    year: Optional[int] = None,
    featured: Optional[bool] = None
):
    database = await MongoDBAtlas.get_database()
    
    query = {}
    
    if series:
        query["series"] = series
    if speaker:
        query["speaker"] = speaker
    if year:
        query["date"] = {
            "$gte": datetime(year, 1, 1, tzinfo=timezone.utc).isoformat(),
            "$lt": datetime(year + 1, 1, 1, tzinfo=timezone.utc).isoformat()
        }
    if featured is not None:
        query["featured"] = featured
    
    sermons = await database.sermons.find(query, {"_id": 0})\
        .sort("date", -1)\
        .skip(skip)\
        .limit(min(limit, 100))\
        .to_list(min(limit, 100))
    
    for sermon in sermons:
        if isinstance(sermon.get('date'), str):
            sermon['date'] = datetime.fromisoformat(sermon['date'].replace('Z', '+00:00'))
        if isinstance(sermon.get('created_at'), str):
            sermon['created_at'] = datetime.fromisoformat(sermon['created_at'].replace('Z', '+00:00'))
    
    return sermons

@api_router.get("/sermons/{sermon_id}", response_model=Sermon)
async def get_sermon(sermon_id: str, request: Request):
    database = await MongoDBAtlas.get_database()
    
    sermon = await database.sermons.find_one({"id": sermon_id}, {"_id": 0})
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    
    if not request.headers.get("Authorization"):
        asyncio.create_task(database.sermons.update_one(
            {"id": sermon_id},
            {"$inc": {"views": 1}}
        ))
    
    if isinstance(sermon.get('date'), str):
        sermon['date'] = datetime.fromisoformat(sermon['date'].replace('Z', '+00:00'))
    if isinstance(sermon.get('created_at'), str):
        sermon['created_at'] = datetime.fromisoformat(sermon['created_at'].replace('Z', '+00:00'))
    
    return Sermon(**sermon)

@api_router.post("/sermons", response_model=Sermon)
async def create_sermon(
    sermon_data: SermonCreate,
    request: Request,
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    database = await MongoDBAtlas.get_database()
    
    sermon = Sermon(**sermon_data.dict())
    # FIXED: Use .dict() instead of .model_dump()
    sermon_dict = sermon.dict()
    sermon_dict['date'] = sermon_dict['date'].isoformat()
    sermon_dict['created_at'] = sermon_dict['created_at'].isoformat()
    
    await database.sermons.insert_one(sermon_dict)
    
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "create_sermon",
        {"sermon_id": sermon.id, "title": sermon.title},
        request
    ))
    
    return sermon

@api_router.put("/sermons/{sermon_id}", response_model=Sermon)
async def update_sermon(
    sermon_id: str,
    sermon_data: SermonCreate,
    request: Request,
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    database = await MongoDBAtlas.get_database()
    
    existing = await database.sermons.find_one({"id": sermon_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Sermon not found")
    
    # FIXED: Use .dict() instead of .model_dump()
    update_data = sermon_data.dict()
    update_data['date'] = update_data['date'].isoformat()
    
    await database.sermons.update_one({"id": sermon_id}, {"$set": update_data})
    
    updated_sermon = await database.sermons.find_one({"id": sermon_id}, {"_id": 0})
    if isinstance(updated_sermon.get('date'), str):
        updated_sermon['date'] = datetime.fromisoformat(updated_sermon['date'].replace('Z', '+00:00'))
    if isinstance(updated_sermon.get('created_at'), str):
        updated_sermon['created_at'] = datetime.fromisoformat(updated_sermon['created_at'].replace('Z', '+00:00'))
    
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "update_sermon",
        {"sermon_id": sermon_id},
        request
    ))
    
    return Sermon(**updated_sermon)

# ==================== EVENT ROUTES ====================

@api_router.get("/events", response_model=List[Event])
async def get_events(
    upcoming: bool = True,
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    featured: Optional[bool] = None
):
    database = await MongoDBAtlas.get_database()
    
    query = {}
    if upcoming:
        query["date"] = {"$gte": datetime.now(timezone.utc).isoformat()}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    
    events = await database.events.find(query, {"_id": 0})\
        .sort("date", 1)\
        .skip(skip)\
        .limit(min(limit, 100))\
        .to_list(min(limit, 100))
    
    for event in events:
        if isinstance(event.get('date'), str):
            event['date'] = datetime.fromisoformat(event['date'].replace('Z', '+00:00'))
        if event.get('end_date') and isinstance(event['end_date'], str):
            event['end_date'] = datetime.fromisoformat(event['end_date'].replace('Z', '+00:00'))
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'].replace('Z', '+00:00'))
    
    return events

@api_router.post("/events", response_model=Event)
async def create_event(
    event_data: EventCreate,
    request: Request,
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    database = await MongoDBAtlas.get_database()
    
    event = Event(**event_data.dict())
    # FIXED: Use .dict() instead of .model_dump()
    event_dict = event.dict()
    event_dict['date'] = event_dict['date'].isoformat()
    if event_dict.get('end_date'):
        event_dict['end_date'] = event_dict['end_date'].isoformat()
    event_dict['created_at'] = event_dict['created_at'].isoformat()
    
    await database.events.insert_one(event_dict)
    
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "create_event",
        {"event_id": event.id, "title": event.title},
        request
    ))
    
    return event

@api_router.post("/events/{event_id}/rsvp")
async def rsvp_event(
    event_id: str, 
    rsvp_data: EventRSVP,
    request: Request
):
    database = await MongoDBAtlas.get_database()
    
    event = await database.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if not event.get('registration_open', True):
        raise HTTPException(status_code=400, detail="Registration is closed for this event")
    
    max_attendees = event.get('max_attendees')
    if max_attendees:
        current_count = event.get('attendees_count', 0)
        if current_count + rsvp_data.attendees > max_attendees:
            raise HTTPException(status_code=400, detail="Event is full")
    
    existing_rsvp = await database.event_rsvps.find_one({"event_id": event_id, "email": rsvp_data.email})
    if existing_rsvp:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    # FIXED: Use .dict() instead of .model_dump()
    rsvp_dict = rsvp_data.dict()
    rsvp_dict['id'] = str(uuid.uuid4())
    rsvp_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await database.event_rsvps.insert_one(rsvp_dict)
    
    await database.events.update_one(
        {"id": event_id},
        {"$inc": {"attendees_count": rsvp_data.attendees}}
    )
    
    return {"message": "RSVP successful", "rsvp_id": rsvp_dict['id']}

# ==================== BLOG ROUTES ====================

@api_router.get("/blog", response_model=List[Blog])
async def get_blogs(
    published_only: bool = True,
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    featured: Optional[bool] = None
):
    database = await MongoDBAtlas.get_database()
    
    query = {}
    if published_only:
        query["published"] = True
    if category:
        query["category"] = category
    if tag:
        query["tags"] = tag
    if featured is not None:
        query["featured"] = featured
    
    blogs = await database.blogs.find(query, {"_id": 0})\
        .sort("created_at", -1)\
        .skip(skip)\
        .limit(min(limit, 100))\
        .to_list(min(limit, 100))
    
    for blog in blogs:
        if isinstance(blog.get('created_at'), str):
            blog['created_at'] = datetime.fromisoformat(blog['created_at'].replace('Z', '+00:00'))
        if isinstance(blog.get('updated_at'), str):
            blog['updated_at'] = datetime.fromisoformat(blog['updated_at'].replace('Z', '+00:00'))
    
    return blogs

@api_router.post("/blog", response_model=Blog)
async def create_blog(
    blog_data: BlogCreate,
    request: Request,
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    database = await MongoDBAtlas.get_database()
    
    blog = Blog(**blog_data.dict())
    # FIXED: Use .dict() instead of .model_dump()
    blog_dict = blog.dict()
    blog_dict['created_at'] = blog_dict['created_at'].isoformat()
    blog_dict['updated_at'] = blog_dict['updated_at'].isoformat()
    
    await database.blogs.insert_one(blog_dict)
    
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "create_blog",
        {"blog_id": blog.id, "title": blog.title},
        request
    ))
    
    return blog

# ==================== DONATION ROUTES ====================

@api_router.post("/donations/create-payment-intent")
async def create_payment_intent(donation_data: DonationCreate):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(donation_data.amount * 100),
            currency=donation_data.currency,
            metadata={
                "donor_name": donation_data.donor_name or "Anonymous",
                "donor_email": donation_data.donor_email or "",
                "message": donation_data.message or "",
                "anonymous": str(donation_data.anonymous)
            },
            description=f"Donation to Heavenly Nature Ministry"
        )
        
        database = await MongoDBAtlas.get_database()
        donation = Donation(**donation_data.dict())
        donation.payment_intent_id = intent.id
        # FIXED: Use .dict() instead of .model_dump()
        donation_dict = donation.dict()
        donation_dict['created_at'] = donation_dict['created_at'].isoformat()
        
        await database.donations.insert_one(donation_dict)
        
        return {
            "client_secret": intent.client_secret,
            "donation_id": donation.id,
            "amount": donation_data.amount,
            "currency": donation_data.currency
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Error creating payment intent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ==================== CONTACT ROUTES ====================

@api_router.post("/contact", response_model=ContactSubmission)
async def submit_contact(
    contact_data: ContactSubmission, 
    request: Request, 
    background_tasks: BackgroundTasks
):
    database = await MongoDBAtlas.get_database()
    
    ip_address = request.client.host if request.client else "unknown"
    
    recent_submissions = await database.contact_submissions.count_documents({
        "ip_address": ip_address,
        "created_at": {"$gt": datetime.now(timezone.utc) - timedelta(hours=1)}
    })
    
    if recent_submissions >= 5:
        raise HTTPException(status_code=429, detail="Too many submissions. Please try again later.")
    
    # FIXED: Use .dict() instead of .model_dump()
    contact_dict = contact_data.dict()
    contact_dict['ip_address'] = ip_address
    contact_dict['user_agent'] = request.headers.get("user-agent")
    contact_dict['created_at'] = contact_dict['created_at'].isoformat()
    
    await database.contact_submissions.insert_one(contact_dict)
    
    background_tasks.add_task(send_contact_notification, contact_data)
    
    return contact_data

# ==================== HEALTH CHECK ====================

@api_router.get("/health")
async def health_check():
    checks = {}
    
    try:
        client = await MongoDBAtlas.get_client()
        if client:
            await client.admin.command('ping', maxTimeMS=5000)
            database = await MongoDBAtlas.get_database()
            collections_count = len(await database.list_collection_names())
            checks['database'] = {
                "status": "healthy",
                "message": "Connected to MongoDB Atlas",
                "collections": collections_count,
                "database": DB_NAME
            }
    except Exception as e:
        checks['database'] = {"status": "unhealthy", "message": str(e)[:100]}
    
    if stripe.api_key:
        try:
            stripe.Balance.retrieve()
            checks['stripe'] = {"status": "healthy", "message": "Connected"}
        except Exception as e:
            checks['stripe'] = {"status": "unhealthy", "message": str(e)[:100]}
    else:
        checks['stripe'] = {"status": "disabled", "message": "Not configured"}
    
    if all([SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD]):
        checks['email'] = {"status": "configured", "message": "Email service configured"}
    else:
        checks['email'] = {"status": "disabled", "message": "Email service not configured"}
    
    checks['api'] = {
        "status": "healthy",
        "version": "2.0.0",
        "environment": ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    critical_checks = ['database', 'api']
    all_healthy = all(
        checks.get(check, {}).get('status') == 'healthy' 
        for check in critical_checks
    )
    
    return {
        "status": "healthy" if all_healthy else "degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": checks
    }

@api_router.get("/")
async def api_root():
    """API root endpoint"""
    return {
        "message": "Heavenly Nature Ministry API",
        "status": "online",
        "version": "2.0.0",
        "environment": ENVIRONMENT,
        "description": "API endpoints available",
        "endpoints": {
            "auth": "/api/auth/*",
            "sermons": "/api/sermons",
            "events": "/api/events",
            "blog": "/api/blog",
            "contact": "/api/contact",
            "donations": "/api/donations/*",
            "health": "/api/health"
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ==================== APP CONFIGURATION ====================

# Add custom middleware for ReDoc first
app.add_middleware(RedocSecurityMiddleware)

# Then include the API router
app.include_router(api_router)

# Configure CORS
cors_origins = os.environ.get('CORS_ORIGINS', '').split(',')
if not cors_origins or cors_origins == ['']:
    cors_origins = ["http://localhost:3000", "http://localhost:5173", "https://hnmbackend-gedp.onrender.com"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "User-Agent",
        "DNT",
        "Cache-Control",
        "X-Mx-ReqToken",
        "Keep-Alive",
        "X-Requested-With",
        "If-Modified-Since",
        "X-CSRF-Token",
        "Access-Control-Allow-Origin",
        "*"
    ],
    expose_headers=["Content-Range", "X-Content-Range", "Content-Length", "Content-Type"],
    max_age=86400,  # 24 hours
)

# IMPORTANT: Configure TrustedHostMiddleware for Render
if IS_PRODUCTION and not RENDER:
    # Only use strict host checking if NOT on Render
    trusted_hosts = os.environ.get('TRUSTED_HOSTS', '').split(',')
    if trusted_hosts and trusted_hosts != ['']:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=trusted_hosts
        )
else:
    # On Render, allow all hosts
    logging.info("Running on Render - disabling strict host checking")

logging.basicConfig(
    level=logging.INFO if IS_PRODUCTION else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
    ]
)

logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting Heavenly Nature Ministry API v2.0.0")
    logger.info(f"🌍 Environment: {ENVIRONMENT}")
    logger.info(f"🗄️  Database: {DB_NAME}")
    logger.info(f"🎯 Render mode: {'ENABLED' if RENDER else 'DISABLED'}")
    
    try:
        await MongoDBAtlas.get_client()
        logger.info("✅ MongoDB Atlas connection established")
        
        await create_indexes()
        logger.info("✅ Database indexes created/verified")
        
        await initialize_admin_user()
        logger.info("✅ Admin user initialized")
        
        logger.info("🎉 Application startup completed successfully")
        
    except Exception as e:
        logger.error(f"💥 Application startup failed: {str(e)}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Shutting down Heavenly Nature Ministry API")
    await MongoDBAtlas.close()
    logger.info("🔒 MongoDB connection closed")
    logger.info("👋 Shutdown complete")
