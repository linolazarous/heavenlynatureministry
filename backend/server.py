from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Body, Response, Request, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict, validator
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
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@heavenlynatureministry.com')

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
                        maxPoolSize=100,  # Max connections in pool
                        minPoolSize=10,   # Min connections in pool
                        maxIdleTimeMS=30000,  # Close idle connections after 30s
                        waitQueueTimeoutMS=10000,  # Wait 10s for available connection
                        serverSelectionTimeoutMS=15000,  # 15s server selection timeout
                        connectTimeoutMS=10000,  # 10s connection timeout
                        socketTimeoutMS=30000,  # 30s socket timeout
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
                    
                    # Provide specific error guidance
                    if "bad auth" in error_msg.lower():
                        logging.error("🔐 Authentication failed. Check MongoDB Atlas credentials.")
                    elif "network error" in error_msg.lower():
                        logging.error("🌐 Network error. Check IP whitelist in MongoDB Atlas.")
                    elif "querySrv" in error_msg or "DNS" in error_msg:
                        logging.error("🔗 DNS resolution failed. Check connection string format.")
                    
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)  # Exponential backoff
                    logging.info(f"⏳ Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)
            
            # All retries failed
            raise HTTPException(
                status_code=500,
                detail="Failed to connect to MongoDB Atlas after multiple attempts. Please check database configuration."
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
        await database.failed_login_attempts.create_index("created_at", expireAfterSeconds=900)  # 15 minutes TTL
        await database.failed_login_attempts.create_index("ip_address")
        await database.failed_login_attempts.create_index([("ip_address", 1), ("created_at", -1)])
        
        logging.info("✅ Database indexes created/verified")
        
    except Exception as e:
        logging.error(f"❌ Error creating database indexes: {str(e)}")
        # Don't crash the app if indexes fail, but log it

# Security
security = HTTPBearer(auto_error=False)

# ==================== FASTAPI APP SETUP ====================

# Create the main app
app = FastAPI(
    title="Heavenly Nature Ministry API",
    description="Backend API for Heavenly Nature Ministry - Production Ready",
    version="2.0.0",
    docs_url="/docs" if not IS_PRODUCTION else None,
    redoc_url="/redoc" if not IS_PRODUCTION else None,
    openapi_url="/openapi.json" if not IS_PRODUCTION else None,
)

# Create API router
api_router = APIRouter(prefix="/api")

# ==================== DATA MODELS ====================

# Base models with validation
class BaseMongoModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
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
    role: str = Field("admin", pattern="^(admin|super_admin)$")
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
    model_config = ConfigDict(extra="ignore")
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
    currency: str = Field("usd", pattern="^(usd|eur|gbp|cad|aud)$")
    donor_name: Optional[str] = Field(None, min_length=2, max_length=100)
    donor_email: Optional[EmailStr] = None
    message: Optional[str] = Field(None, max_length=500)
    recurring: bool = False
    anonymous: bool = False

class Donation(DonationCreate, BaseMongoModel):
    payment_intent_id: Optional[str] = None
    status: str = Field("pending", pattern="^(pending|succeeded|failed|cancelled|refunded)$")
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
    status: str = Field("new", pattern="^(new|read|replied|archived)$")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    @validator('phone')
    def validate_phone(cls, v):
        if v and not re.match(r'^\+?1?\d{9,15}$', v):
            raise ValueError('Invalid phone number format')
        return v

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
        "jti": str(uuid.uuid4())  # Unique token ID for revocation tracking
    })
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(
            token, 
            JWT_SECRET_KEY, 
            algorithms=[JWT_ALGORITHM],
            options={"require": ["exp", "iat", "type"]}
        )
        
        # Additional validation
        if payload.get("type") != "access":
            raise jwt.InvalidTokenError("Invalid token type")
            
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication")

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> User:
    """Get current authenticated user"""
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
    """Verify admin session from cookie or header"""
    session_token = None
    
    # Try to get from cookie first
    session_token = request.cookies.get("admin_session")
    
    # If not in cookie, try Authorization header
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
    
    # Check if session is expired
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
    
    # Get user info
    user = await database.admin_users.find_one(
        {"id": session['user_id'], "is_active": True},
        {"_id": 0, "hashed_password": 0}
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    # Update session expiry (sliding window)
    new_expiry = datetime.now(timezone.utc) + timedelta(days=1)
    await database.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {"expires_at": new_expiry}}
    )
    
    return {"session": session, "user": user}

async def get_current_admin(request: Request) -> Dict[str, Any]:
    """Dependency for admin routes"""
    return await verify_admin_session(request)

def validate_email_address(email: str) -> bool:
    """Validate email address format"""
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False

async def log_activity(user_id: str, action: str, details: Dict[str, Any] = None, request: Request = None):
    """Log user activity for audit trail"""
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
    """Send email using SMTP"""
    if not all([SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD]):
        logging.warning("Email configuration not set. Skipping email send.")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f'{FROM_NAME} <{FROM_EMAIL}>'
        msg['To'] = to_email
        msg['Reply-To'] = FROM_EMAIL
        msg['Date'] = datetime.now().strftime("%a, %d %b %Y %H:%M:%S %z")
        
        # Attach both HTML and plain text versions
        if text_content:
            part1 = MIMEText(text_content, 'plain', 'utf-8')
            msg.attach(part1)
        
        part2 = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(part2)
        
        # Send email with timeout
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
    """Send notification email for contact form submission"""
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
    """Admin login with username and password"""
    database = await MongoDBAtlas.get_database()
    
    # Rate limiting by IP
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "")
    
    # Check for too many failed attempts (last 15 minutes)
    failed_attempts = await database.failed_login_attempts.count_documents({
        "ip_address": ip_address,
        "created_at": {"$gt": datetime.now(timezone.utc) - timedelta(minutes=15)}
    })
    
    if failed_attempts >= 10:
        raise HTTPException(
            status_code=429, 
            detail="Too many login attempts. Please try again in 15 minutes."
        )
    
    # Find admin user
    user_doc = await database.admin_users.find_one(
        {"username": login_data.username, "is_active": True},
        {"_id": 0}
    )
    
    if not user_doc:
        # Log failed attempt
        await database.failed_login_attempts.insert_one({
            "id": str(uuid.uuid4()),
            "username": login_data.username,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Verify password
    if not verify_password(login_data.password, user_doc['hashed_password']):
        # Log failed attempt
        await database.failed_login_attempts.insert_one({
            "id": str(uuid.uuid4()),
            "username": login_data.username,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Clear failed attempts for this IP
    await database.failed_login_attempts.delete_many({"ip_address": ip_address})
    
    # Create session token
    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=1)
    
    new_session = UserSession(
        user_id=user_doc['id'],
        session_token=session_token,
        expires_at=expires_at,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    session_dict = new_session.model_dump()
    session_dict['created_at'] = session_dict['created_at'].isoformat()
    session_dict['expires_at'] = session_dict['expires_at'].isoformat()
    
    await database.user_sessions.insert_one(session_dict)
    
    # Update last login
    await database.admin_users.update_one(
        {"id": user_doc['id']},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Set secure HTTP-only cookie
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
    
    # Log activity
    background_tasks.add_task(log_activity, user_doc['id'], "admin_login", {
        "ip_address": ip_address,
        "user_agent": user_agent[:100]
    }, request)
    
    # Return user data (without sensitive info)
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
    """Register a new user"""
    database = await MongoDBAtlas.get_database()
    
    # Validate email
    if not validate_email_address(user_data.email):
        raise HTTPException(status_code=400, detail="Invalid email address")
    
    # Check if user exists
    existing_user = await database.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(**user_data.model_dump(exclude={'password'}))
    
    user_dict = user.model_dump()
    user_dict['hashed_password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    user_dict['updated_at'] = user_dict['updated_at'].isoformat()
    
    await database.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    
    # Log activity
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
    """User login"""
    database = await MongoDBAtlas.get_database()
    
    # Rate limiting
    ip_address = request.client.host if request.client else "unknown"
    
    failed_attempts = await database.failed_login_attempts.count_documents({
        "email": credentials.email,
        "created_at": {"$gt": datetime.now(timezone.utc) - timedelta(minutes=15)}
    })
    
    if failed_attempts >= 5:
        raise HTTPException(status_code=429, detail="Too many login attempts. Please try again later.")
    
    user_doc = await database.users.find_one({"email": credentials.email, "is_active": True}, {"_id": 0})
    if not user_doc:
        # Log failed attempt
        await database.failed_login_attempts.insert_one({
            "id": str(uuid.uuid4()),
            "email": credentials.email,
            "ip_address": ip_address,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc.get('hashed_password', '')):
        # Log failed attempt
        await database.failed_login_attempts.insert_one({
            "id": str(uuid.uuid4()),
            "email": credentials.email,
            "ip_address": ip_address,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Clear failed attempts
    await database.failed_login_attempts.delete_many({"email": credentials.email})
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'hashed_password'})
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    
    # Update last login
    await database.users.update_one(
        {"id": user.id},
        {"$set": {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "last_login": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log activity
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
    """Get current user info"""
    return current_user

@api_router.post("/auth/logout")
async def logout(response: Response, request: Request):
    """Logout user"""
    database = await MongoDBAtlas.get_database()
    session_token = request.cookies.get("admin_session")
    
    if session_token:
        # Mark session as inactive instead of deleting (for audit trail)
        await database.user_sessions.update_one(
            {"session_token": session_token},
            {"$set": {"is_active": False, "logged_out_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    # Clear cookie
    response.delete_cookie(
        key="admin_session",
        path="/api"
    )
    return {"message": "Logged out successfully"}

@api_router.get("/auth/check")
async def check_auth(request: Request):
    """Check if admin is authenticated"""
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
    """Refresh JWT token"""
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
        
        # Check if user exists and is active
        user_doc = await database.users.find_one({"id": user_id, "is_active": True}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Create new token
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
    """Initialize admin user on startup"""
    database = await MongoDBAtlas.get_database()
    
    # Check if admin user exists
    admin_user = await database.admin_users.find_one({"username": ADMIN_USERNAME})
    
    if not admin_user:
        # Create admin user with secure password
        hashed_password = hash_password(ADMIN_PASSWORD)
        admin_user = AdminUser(
            username=ADMIN_USERNAME,
            email=ADMIN_EMAIL,
            name="Heavenly Nature Administrator",
            hashed_password=hashed_password,
            role="super_admin",
            permissions=["read", "write", "delete", "admin", "users", "content", "finance"]
        )
        
        admin_dict = admin_user.model_dump()
        admin_dict['created_at'] = admin_dict['created_at'].isoformat()
        
        await database.admin_users.insert_one(admin_dict)
        logging.info(f"✅ Admin user '{ADMIN_USERNAME}' created successfully")
    else:
        # Update password if it's the default or needs update
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
    """Get sermons with optional filtering"""
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
        .limit(min(limit, 100))  # Cap limit at 100
        .to_list(min(limit, 100))
    
    for sermon in sermons:
        if isinstance(sermon.get('date'), str):
            sermon['date'] = datetime.fromisoformat(sermon['date'].replace('Z', '+00:00'))
        if isinstance(sermon.get('created_at'), str):
            sermon['created_at'] = datetime.fromisoformat(sermon['created_at'].replace('Z', '+00:00'))
    
    return sermons

@api_router.get("/sermons/{sermon_id}", response_model=Sermon)
async def get_sermon(sermon_id: str, request: Request):
    """Get a specific sermon by ID"""
    database = await MongoDBAtlas.get_database()
    
    sermon = await database.sermons.find_one({"id": sermon_id}, {"_id": 0})
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    
    # Increment views asynchronously (only for non-admin requests)
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
    """Create a new sermon (admin only)"""
    database = await MongoDBAtlas.get_database()
    
    sermon = Sermon(**sermon_data.model_dump())
    sermon_dict = sermon.model_dump()
    sermon_dict['date'] = sermon_dict['date'].isoformat()
    sermon_dict['created_at'] = sermon_dict['created_at'].isoformat()
    
    await database.sermons.insert_one(sermon_dict)
    
    # Log activity
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "create_sermon",
        {"sermon_id": sermon.id, "title": sermon.title},
        request
    ))
    
    return sermon

# ... [Rest of the routes remain the same as your original code, 
# but with database calls using MongoDBAtlas.get_database() instead of get_database()]
# For brevity, I'm showing the pattern. You should update all database calls.

# ==================== HEALTH CHECK ====================

@api_router.get("/health")
async def health_check():
    """Comprehensive health check"""
    checks = {}
    
    # Database check
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
    
    # Stripe check
    if stripe.api_key:
        try:
            stripe.Balance.retrieve()
            checks['stripe'] = {"status": "healthy", "message": "Connected"}
        except Exception as e:
            checks['stripe'] = {"status": "unhealthy", "message": str(e)[:100]}
    else:
        checks['stripe'] = {"status": "disabled", "message": "Not configured"}
    
    # Email check
    if all([SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD]):
        checks['email'] = {"status": "configured", "message": "Email service configured"}
    else:
        checks['email'] = {"status": "disabled", "message": "Email service not configured"}
    
    # API status
    checks['api'] = {
        "status": "healthy",
        "version": "2.0.0",
        "environment": ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Overall status
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
async def root():
    return {
        "message": "Heavenly Nature Ministry API",
        "status": "online",
        "version": "2.0.0",
        "environment": ENVIRONMENT,
        "docs": "/docs" if not IS_PRODUCTION else None,
        "health": "/api/health"
    }

# ==================== APP CONFIGURATION ====================

app.include_router(api_router)

# CORS configuration
cors_origins = os.environ.get('CORS_ORIGINS', '').split(',')
if not cors_origins or cors_origins == ['']:
    cors_origins = ["http://localhost:3000", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "X-Content-Range"],
    max_age=600,
)

# Trusted hosts middleware for production
if IS_PRODUCTION:
    trusted_hosts = os.environ.get('TRUSTED_HOSTS', '').split(',')
    if trusted_hosts and trusted_hosts != ['']:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=trusted_hosts
        )

# Logging configuration
logging.basicConfig(
    level=logging.INFO if IS_PRODUCTION else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
    ]
)

logger = logging.getLogger(__name__)

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("🚀 Starting Heavenly Nature Ministry API v2.0.0")
    logger.info(f"🌍 Environment: {ENVIRONMENT}")
    logger.info(f"🗄️  Database: {DB_NAME}")
    
    try:
        # Initialize database connection
        await MongoDBAtlas.get_client()
        logger.info("✅ MongoDB Atlas connection established")
        
        # Create database indexes
        await create_indexes()
        logger.info("✅ Database indexes created/verified")
        
        # Initialize admin user
        await initialize_admin_user()
        logger.info("✅ Admin user initialized")
        
        logger.info("🎉 Application startup completed successfully")
        
    except Exception as e:
        logger.error(f"💥 Application startup failed: {str(e)}")
        # Don't crash, but log the error. The app will try to connect on first request.

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Shutting down Heavenly Nature Ministry API")
    await MongoDBAtlas.close()
    logger.info("🔒 MongoDB connection closed")
    logger.info("👋 Shutdown complete")
