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
# Add these imports at the top
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Email configuration from environment
SMTP_HOST = os.environ.get('SMTP_HOST')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USERNAME = os.environ.get('SMTP_USERNAME')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'info@heavenlynatureministry.com')
FROM_NAME = os.environ.get('FROM_NAME', 'Heavenly Nature Ministry')

async def send_email(to_email: str, subject: str, html_content: str, text_content: str = None):
    """Send email using Zoho SMTP"""
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
        
        # Attach both HTML and plain text versions
        if text_content:
            part1 = MIMEText(text_content, 'plain')
            msg.attach(part1)
        
        part2 = MIMEText(html_content, 'html')
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()  # Secure the connection
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        logging.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logging.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

# Update the contact submission endpoint to send emails
@api_router.post("/contact", response_model=ContactSubmission)
async def submit_contact(contact_data: ContactSubmission, request: Request, background_tasks: BackgroundTasks):
    """Submit contact form with email notification"""
    # ... existing rate limiting and database code ...
    
    # Send email notification in background
    background_tasks.add_task(send_contact_notification, contact_data)
    
    return contact_data

async def send_contact_notification(contact_data: ContactSubmission):
    """Send notification email for contact form submission"""
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body>
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> {contact_data.name}</p>
        <p><strong>Email:</strong> {contact_data.email}</p>
        <p><strong>Phone:</strong> {contact_data.phone or 'Not provided'}</p>
        <p><strong>Subject:</strong> {contact_data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>{contact_data.message}</p>
        <hr>
        <p>Submitted on: {contact_data.created_at}</p>
    </body>
    </html>
    """
    
    text_content = f"""
    New Contact Form Submission
    Name: {contact_data.name}
    Email: {contact_data.email}
    Phone: {contact_data.phone or 'Not provided'}
    Subject: {contact_data.subject}
    Message: {contact_data.message}
    Submitted on: {contact_data.created_at}
    """
    
    await send_email(
        to_email=FROM_EMAIL,  # Send to admin
        subject=f"New Contact: {contact_data.subject}",
        html_content=html_content,
        text_content=text_content
    )
    
# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configuration
MONGO_URL = os.environ.get('MONGO_URL')
if not MONGO_URL:
    raise ValueError("MONGO_URL environment variable is required")

DB_NAME = os.environ.get('DB_NAME', 'heavenly_nature_ministry')
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
if not JWT_SECRET_KEY or JWT_SECRET_KEY == 'your-secret-key-change-in-production':
    raise ValueError("JWT_SECRET_KEY must be set in production")
    
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', "HS256")
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', 24))

# Admin credentials from environment
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'HeavenlyNature')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', '26@HNM')
if not ADMIN_USERNAME or not ADMIN_PASSWORD:
    raise ValueError("ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment variables")

# Stripe configuration
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
stripe.api_key = STRIPE_SECRET_KEY if STRIPE_SECRET_KEY else None

# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # More secure rounds for production
)

# MongoDB connection with retry logic
async def get_mongo_client():
    max_retries = 3
    for attempt in range(max_retries):
        try:
            client = AsyncIOMotorClient(
                MONGO_URL,
                maxPoolSize=100,
                minPoolSize=10,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=30000
            )
            await client.admin.command('ping')
            logging.info("Successfully connected to MongoDB")
            return client
        except Exception as e:
            logging.warning(f"MongoDB connection attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1)
            else:
                logging.error("Failed to connect to MongoDB after all retries")
                raise

client = None
try:
    client = asyncio.run(get_mongo_client())
except Exception as e:
    logging.error(f"Could not initialize MongoDB client: {str(e)}")
    client = None

db = client[DB_NAME] if client else None

# Create indexes on startup
async def create_indexes():
    if db:
        try:
            # Users indexes
            await db.users.create_index("email", unique=True)
            await db.users.create_index("created_at")
            
            # Admin users indexes
            await db.admin_users.create_index("username", unique=True)
            await db.admin_users.create_index("email", unique=True)
            
            # User sessions indexes
            await db.user_sessions.create_index("session_token", unique=True)
            await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)  # TTL index
            await db.user_sessions.create_index("user_id")
            
            # Sermons indexes
            await db.sermons.create_index("date")
            await db.sermons.create_index("created_at")
            await db.sermons.create_index("speaker")
            
            # Events indexes
            await db.events.create_index("date")
            await db.events.create_index("created_at")
            await db.events.create_index("category")
            
            # Event RSVPs indexes
            await db.event_rsvps.create_index("event_id")
            await db.event_rsvps.create_index("email")
            await db.event_rsvps.create_index("created_at")
            
            # Blogs indexes
            await db.blogs.create_index("created_at")
            await db.blogs.create_index("published")
            await db.blogs.create_index("category")
            
            # Donations indexes
            await db.donations.create_index("created_at")
            await db.donations.create_index("status")
            await db.donations.create_index("payment_intent_id", unique=True)
            
            # Contact submissions indexes
            await db.contact_submissions.create_index("created_at")
            await db.contact_submissions.create_index("status")
            await db.contact_submissions.create_index("email")
            
            logging.info("Database indexes created successfully")
        except Exception as e:
            logging.error(f"Error creating indexes: {str(e)}")

# Security
security = HTTPBearer(auto_error=False)

# Create the main app
app = FastAPI(
    title="Heavenly Nature Ministry API",
    description="Backend API for Heavenly Nature Ministry website",
    version="1.0.0",
    docs_url="/docs" if os.environ.get('ENVIRONMENT') != 'production' else None,
    redoc_url="/redoc" if os.environ.get('ENVIRONMENT') != 'production' else None,
)

# Create API router
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

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
    role: str = "admin"

class AdminUserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8)

class UserSession(BaseMongoModel):
    user_id: str
    session_token: str
    expires_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

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
    duration_minutes: Optional[int] = None
    
    @validator('audio_url', 'video_url', 'thumbnail_url')
    def validate_url(cls, v):
        if v and not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        return v

class Sermon(SermonCreate, BaseMongoModel):
    views: int = 0
    downloads: int = 0

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
    status: str = Field("pending", pattern="^(pending|succeeded|failed|cancelled)$")
    receipt_sent: bool = False

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
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
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
    
    user_doc = await db.users.find_one({"id": user_id, "is_active": True}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    return User(**user_doc)

async def verify_admin_session(request: Request) -> Dict[str, Any]:
    """Verify admin session from cookie or header"""
    session_token = None
    
    # Try to get from cookie first
    session_token = request.cookies.get("session_token")
    
    # If not in cookie, try Authorization header
    if not session_token and request.headers.get("Authorization"):
        auth_header = request.headers.get("Authorization")
        if auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Session token required")
    
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check if session is expired
    if isinstance(session.get('expires_at'), str):
        expires_at = datetime.fromisoformat(session['expires_at'])
    else:
        expires_at = session['expires_at']
    
    if datetime.now(timezone.utc) > expires_at:
        await db.user_sessions.delete_one({"session_token": session_token})
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user info
    user = await db.admin_users.find_one(
        {"id": session['user_id'], "is_active": True},
        {"_id": 0, "hashed_password": 0}
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    # Update last activity
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {"expires_at": datetime.now(timezone.utc) + timedelta(days=1)}}
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

async def log_activity(user_id: str, action: str, details: Dict[str, Any] = None):
    """Log user activity for audit trail"""
    try:
        log_entry = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "action": action,
            "details": details or {},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "ip_address": None,  # Would need request context
            "user_agent": None
        }
        await db.activity_logs.insert_one(log_entry)
    except Exception as e:
        logging.error(f"Failed to log activity: {str(e)}")

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
    # Rate limiting check (simple implementation)
    ip_address = request.client.host if request.client else "unknown"
    
    # Check for too many failed attempts
    failed_attempts = await db.failed_login_attempts.count_documents({
        "ip_address": ip_address,
        "created_at": {"$gt": datetime.now(timezone.utc) - timedelta(minutes=15)}
    })
    
    if failed_attempts >= 5:
        raise HTTPException(status_code=429, detail="Too many login attempts. Please try again later.")
    
    # Find admin user
    user_doc = await db.admin_users.find_one(
        {"username": login_data.username, "is_active": True},
        {"_id": 0}
    )
    
    if not user_doc:
        # Log failed attempt
        await db.failed_login_attempts.insert_one({
            "id": str(uuid.uuid4()),
            "username": login_data.username,
            "ip_address": ip_address,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Verify password
    if not verify_password(login_data.password, user_doc['hashed_password']):
        # Log failed attempt
        await db.failed_login_attempts.insert_one({
            "id": str(uuid.uuid4()),
            "username": login_data.username,
            "ip_address": ip_address,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Clear failed attempts for this IP
    await db.failed_login_attempts.delete_many({"ip_address": ip_address})
    
    # Create session token
    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=1)
    
    new_session = UserSession(
        user_id=user_doc['id'],
        session_token=session_token,
        expires_at=expires_at,
        ip_address=ip_address,
        user_agent=request.headers.get("user-agent")
    )
    
    session_dict = new_session.model_dump()
    session_dict['created_at'] = session_dict['created_at'].isoformat()
    session_dict['expires_at'] = session_dict['expires_at'].isoformat()
    
    await db.user_sessions.insert_one(session_dict)
    
    # Update last login
    await db.admin_users.update_one(
        {"id": user_doc['id']},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Set httpOnly cookie
    secure_cookie = os.environ.get('ENVIRONMENT') == 'production'
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=secure_cookie,
        samesite="lax" if not secure_cookie else "none",
        max_age=24 * 60 * 60,  # 1 day
        path="/"
    )
    
    # Log activity
    background_tasks.add_task(log_activity, user_doc['id'], "admin_login", {
        "ip_address": ip_address,
        "user_agent": request.headers.get("user-agent")
    })
    
    # Return user data (without sensitive info)
    return {
        "user_id": user_doc['id'],
        "username": user_doc['username'],
        "email": user_doc['email'],
        "name": user_doc['name'],
        "role": user_doc.get('role', 'admin'),
        "session_token": session_token,
        "expires_at": expires_at.isoformat()
    }

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate, background_tasks: BackgroundTasks):
    """Register a new user"""
    # Validate email
    if not validate_email_address(user_data.email):
        raise HTTPException(status_code=400, detail="Invalid email address")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(**user_data.model_dump(exclude={'password'}))
    
    user_dict = user.model_dump()
    user_dict['hashed_password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    user_dict['updated_at'] = user_dict['updated_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    
    # Log activity
    background_tasks.add_task(log_activity, user.id, "user_registration")
    
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
    # Rate limiting check
    ip_address = request.client.host if request.client else "unknown"
    
    failed_attempts = await db.failed_login_attempts.count_documents({
        "email": credentials.email,
        "created_at": {"$gt": datetime.now(timezone.utc) - timedelta(minutes=15)}
    })
    
    if failed_attempts >= 5:
        raise HTTPException(status_code=429, detail="Too many login attempts. Please try again later.")
    
    user_doc = await db.users.find_one({"email": credentials.email, "is_active": True}, {"_id": 0})
    if not user_doc:
        # Log failed attempt
        await db.failed_login_attempts.insert_one({
            "id": str(uuid.uuid4()),
            "email": credentials.email,
            "ip_address": ip_address,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc.get('hashed_password', '')):
        # Log failed attempt
        await db.failed_login_attempts.insert_one({
            "id": str(uuid.uuid4()),
            "email": credentials.email,
            "ip_address": ip_address,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Clear failed attempts
    await db.failed_login_attempts.delete_many({"email": credentials.email})
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'hashed_password'})
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    
    # Update last login
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Log activity
    background_tasks.add_task(log_activity, user.id, "user_login", {
        "ip_address": ip_address
    })
    
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
    session_token = request.cookies.get("session_token")
    
    if session_token:
        # Delete session from database
        await db.user_sessions.delete_one({"session_token": session_token})
    
    # Clear cookie
    response.delete_cookie(
        key="session_token",
        path="/"
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
                "role": auth_data["user"].get("role", "admin")
            }
        }
    except HTTPException:
        return {"authenticated": False}

@api_router.post("/auth/refresh")
async def refresh_token(request: Request):
    """Refresh JWT token"""
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
        user_doc = await db.users.find_one({"id": user_id, "is_active": True}, {"_id": 0})
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
    if not db:
        return
    
    # Check if admin user exists
    admin_user = await db.admin_users.find_one({"username": ADMIN_USERNAME})
    
    if not admin_user:
        # Create admin user
        hashed_password = hash_password(ADMIN_PASSWORD)
        admin_user = AdminUser(
            username=ADMIN_USERNAME,
            email=os.environ.get('ADMIN_EMAIL', 'admin@heavenlynature.org'),
            name="Heavenly Nature Admin",
            hashed_password=hashed_password,
            role="super_admin"
        )
        
        admin_dict = admin_user.model_dump()
        admin_dict['created_at'] = admin_dict['created_at'].isoformat()
        
        await db.admin_users.insert_one(admin_dict)
        logging.info(f"Admin user '{ADMIN_USERNAME}' created successfully")
    else:
        logging.info(f"Admin user '{ADMIN_USERNAME}' already exists")

# ==================== SERMON ROUTES ====================

@api_router.get("/sermons", response_model=List[Sermon])
async def get_sermons(
    skip: int = 0,
    limit: int = 50,
    series: Optional[str] = None,
    speaker: Optional[str] = None,
    year: Optional[int] = None
):
    """Get sermons with optional filtering"""
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
    
    sermons = await db.sermons.find(query, {"_id": 0})\
        .sort("date", -1)\
        .skip(skip)\
        .limit(limit)\
        .to_list(limit)
    
    for sermon in sermons:
        if isinstance(sermon.get('date'), str):
            sermon['date'] = datetime.fromisoformat(sermon['date'])
        if isinstance(sermon.get('created_at'), str):
            sermon['created_at'] = datetime.fromisoformat(sermon['created_at'])
    
    return sermons

@api_router.get("/sermons/{sermon_id}", response_model=Sermon)
async def get_sermon(sermon_id: str):
    """Get a specific sermon by ID"""
    sermon = await db.sermons.find_one({"id": sermon_id}, {"_id": 0})
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    
    # Increment views asynchronously
    asyncio.create_task(db.sermons.update_one(
        {"id": sermon_id},
        {"$inc": {"views": 1}}
    ))
    
    if isinstance(sermon.get('date'), str):
        sermon['date'] = datetime.fromisoformat(sermon['date'])
    if isinstance(sermon.get('created_at'), str):
        sermon['created_at'] = datetime.fromisoformat(sermon['created_at'])
    
    return Sermon(**sermon)

@api_router.post("/sermons", response_model=Sermon)
async def create_sermon(
    sermon_data: SermonCreate,
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    """Create a new sermon (admin only)"""
    sermon = Sermon(**sermon_data.model_dump())
    sermon_dict = sermon.model_dump()
    sermon_dict['date'] = sermon_dict['date'].isoformat()
    sermon_dict['created_at'] = sermon_dict['created_at'].isoformat()
    
    await db.sermons.insert_one(sermon_dict)
    
    # Log activity
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "create_sermon",
        {"sermon_id": sermon.id, "title": sermon.title}
    ))
    
    return sermon

@api_router.put("/sermons/{sermon_id}", response_model=Sermon)
async def update_sermon(
    sermon_id: str,
    sermon_data: SermonCreate,
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    """Update a sermon (admin only)"""
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
    
    # Log activity
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "update_sermon",
        {"sermon_id": sermon_id}
    ))
    
    return Sermon(**updated_sermon)

@api_router.delete("/sermons/{sermon_id}")
async def delete_sermon(
    sermon_id: str,
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    """Delete a sermon (admin only)"""
    result = await db.sermons.delete_one({"id": sermon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sermon not found")
    
    # Log activity
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "delete_sermon",
        {"sermon_id": sermon_id}
    ))
    
    return {"message": "Sermon deleted successfully"}

@api_router.post("/sermons/{sermon_id}/download")
async def increment_download(sermon_id: str):
    """Increment download count for a sermon"""
    result = await db.sermons.update_one(
        {"id": sermon_id},
        {"$inc": {"downloads": 1}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Sermon not found")
    
    return {"message": "Download count incremented"}

# ==================== EVENT ROUTES ====================

@api_router.get("/events", response_model=List[Event])
async def get_events(
    upcoming: bool = True,
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None
):
    """Get events with optional filtering"""
    query = {}
    if upcoming:
        query["date"] = {"$gte": datetime.now(timezone.utc).isoformat()}
    if category:
        query["category"] = category
    
    events = await db.events.find(query, {"_id": 0})\
        .sort("date", 1)\
        .skip(skip)\
        .limit(limit)\
        .to_list(limit)
    
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
    """Get a specific event by ID"""
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
async def create_event(
    event_data: EventCreate,
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    """Create a new event (admin only)"""
    event = Event(**event_data.model_dump())
    event_dict = event.model_dump()
    event_dict['date'] = event_dict['date'].isoformat()
    if event_dict.get('end_date'):
        event_dict['end_date'] = event_dict['end_date'].isoformat()
    event_dict['created_at'] = event_dict['created_at'].isoformat()
    
    await db.events.insert_one(event_dict)
    
    # Log activity
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "create_event",
        {"event_id": event.id, "title": event.title}
    ))
    
    return event

@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(
    event_id: str,
    event_data: EventCreate,
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    """Update an event (admin only)"""
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
    
    # Log activity
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "update_event",
        {"event_id": event_id}
    ))
    
    return Event(**updated_event)

@api_router.delete("/events/{event_id}")
async def delete_event(
    event_id: str,
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    """Delete an event (admin only)"""
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Also delete related RSVPs
    await db.event_rsvps.delete_many({"event_id": event_id})
    
    # Log activity
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "delete_event",
        {"event_id": event_id}
    ))
    
    return {"message": "Event deleted successfully"}

@api_router.post("/events/{event_id}/rsvp")
async def rsvp_event(event_id: str, rsvp_data: EventRSVP):
    """RSVP for an event"""
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if registration is open
    if not event.get('registration_open', True):
        raise HTTPException(status_code=400, detail="Registration is closed for this event")
    
    # Check max attendees
    max_attendees = event.get('max_attendees')
    if max_attendees:
        current_count = event.get('attendees_count', 0)
        if current_count + rsvp_data.attendees > max_attendees:
            raise HTTPException(status_code=400, detail="Event is full")
    
    # Check if already registered
    existing_rsvp = await db.event_rsvps.find_one({"event_id": event_id, "email": rsvp_data.email})
    if existing_rsvp:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    rsvp_dict = rsvp_data.model_dump()
    rsvp_dict['id'] = str(uuid.uuid4())
    rsvp_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.event_rsvps.insert_one(rsvp_dict)
    
    # Update attendees count
    await db.events.update_one(
        {"id": event_id},
        {"$inc": {"attendees_count": rsvp_data.attendees}}
    )
    
    return {"message": "RSVP successful", "rsvp_id": rsvp_dict['id']}

@api_router.get("/events/{event_id}/rsvps")
async def get_event_rsvps(
    event_id: str,
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    """Get RSVPs for an event (admin only)"""
    rsvps = await db.event_rsvps.find(
        {"event_id": event_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    return rsvps

# ==================== BLOG ROUTES ====================

@api_router.get("/blog", response_model=List[Blog])
async def get_blogs(
    published_only: bool = True,
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    featured: Optional[bool] = None
):
    """Get blog posts with optional filtering"""
    query = {}
    if published_only:
        query["published"] = True
    if category:
        query["category"] = category
    if tag:
        query["tags"] = tag
    if featured is not None:
        query["featured"] = featured
    
    blogs = await db.blogs.find(query, {"_id": 0})\
        .sort("created_at", -1)\
        .skip(skip)\
        .limit(limit)\
        .to_list(limit)
    
    for blog in blogs:
        if isinstance(blog.get('created_at'), str):
            blog['created_at'] = datetime.fromisoformat(blog['created_at'])
        if isinstance(blog.get('updated_at'), str):
            blog['updated_at'] = datetime.fromisoformat(blog['updated_at'])
    
    return blogs

@api_router.get("/blog/{blog_id}", response_model=Blog)
async def get_blog(blog_id: str):
    """Get a specific blog post by ID"""
    blog = await db.blogs.find_one({"id": blog_id}, {"_id": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Increment views asynchronously
    asyncio.create_task(db.blogs.update_one(
        {"id": blog_id},
        {"$inc": {"views": 1}}
    ))
    
    if isinstance(blog.get('created_at'), str):
        blog['created_at'] = datetime.fromisoformat(blog['created_at'])
    if isinstance(blog.get('updated_at'), str):
        blog['updated_at'] = datetime.fromisoformat(blog['updated_at'])
    
    return Blog(**blog)

@api_router.post("/blog", response_model=Blog)
async def create_blog(
    blog_data: BlogCreate,
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    """Create a new blog post (admin only)"""
    blog = Blog(**blog_data.model_dump())
    blog_dict = blog.model_dump()
    blog_dict['created_at'] = blog_dict['created_at'].isoformat()
    blog_dict['updated_at'] = blog_dict['updated_at'].isoformat()
    
    await db.blogs.insert_one(blog_dict)
    
    # Log activity
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "create_blog",
        {"blog_id": blog.id, "title": blog.title}
    ))
    
    return blog

@api_router.put("/blog/{blog_id}", response_model=Blog)
async def update_blog(
    blog_id: str,
    blog_data: BlogCreate,
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    """Update a blog post (admin only)"""
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
    
    # Log activity
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "update_blog",
        {"blog_id": blog_id}
    ))
    
    return Blog(**updated_blog)

@api_router.delete("/blog/{blog_id}")
async def delete_blog(
    blog_id: str,
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    """Delete a blog post (admin only)"""
    result = await db.blogs.delete_one({"id": blog_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Log activity
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "delete_blog",
        {"blog_id": blog_id}
    ))
    
    return {"message": "Blog post deleted successfully"}

@api_router.post("/blog/{blog_id}/like")
async def like_blog(blog_id: str):
    """Like a blog post"""
    result = await db.blogs.update_one(
        {"id": blog_id},
        {"$inc": {"likes": 1}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    return {"message": "Blog post liked"}

# ==================== DONATION ROUTES ====================

@api_router.post("/donations/create-payment-intent")
async def create_payment_intent(donation_data: DonationCreate):
    """Create Stripe payment intent for donation"""
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
                "message": donation_data.message or "",
                "anonymous": str(donation_data.anonymous)
            },
            description=f"Donation to Heavenly Nature Ministry"
        )
        
        # Save donation to database
        donation = Donation(**donation_data.model_dump())
        donation.payment_intent_id = intent.id
        donation_dict = donation.model_dump()
        donation_dict['created_at'] = donation_dict['created_at'].isoformat()
        
        await db.donations.insert_one(donation_dict)
        
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

@api_router.post("/donations/{donation_id}/confirm")
async def confirm_donation(donation_id: str, payment_intent_id: str = Body(..., embed=True)):
    """Confirm donation payment"""
    donation = await db.donations.find_one({"id": donation_id})
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        status_mapping = {
            "succeeded": "succeeded",
            "processing": "pending",
            "requires_payment_method": "failed",
            "canceled": "cancelled"
        }
        donation_status = status_mapping.get(intent.status, "pending")
        
        await db.donations.update_one(
            {"id": donation_id},
            {"$set": {"status": donation_status}}
        )
        
        return {"status": donation_status, "amount_received": intent.amount_received}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Error confirming donation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/donations", response_model=List[Donation])
async def get_donations(
    auth_data: Dict[str, Any] = Depends(get_current_admin),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
):
    """Get all donations (admin only)"""
    query = {}
    if status:
        query["status"] = status
    
    donations = await db.donations.find(query, {"_id": 0})\
        .sort("created_at", -1)\
        .skip(skip)\
        .limit(limit)\
        .to_list(limit)
    
    for donation in donations:
        if isinstance(donation.get('created_at'), str):
            donation['created_at'] = datetime.fromisoformat(donation['created_at'])
    
    return donations

@api_router.get("/donations/summary")
async def get_donation_summary(auth_data: Dict[str, Any] = Depends(get_current_admin)):
    """Get donation summary (admin only)"""
    pipeline = [
        {"$match": {"status": "succeeded"}},
        {"$group": {
            "_id": None,
            "total_amount": {"$sum": "$amount"},
            "total_count": {"$sum": 1},
            "average_amount": {"$avg": "$amount"}
        }}
    ]
    
    result = await db.donations.aggregate(pipeline).to_list(1)
    
    if result:
        summary = result[0]
        return {
            "total_amount": summary.get("total_amount", 0),
            "total_count": summary.get("total_count", 0),
            "average_amount": summary.get("average_amount", 0)
        }
    
    return {"total_amount": 0, "total_count": 0, "average_amount": 0}

# ==================== CONTACT ROUTES ====================

@api_router.post("/contact", response_model=ContactSubmission)
async def submit_contact(contact_data: ContactSubmission, request: Request):
    """Submit contact form"""
    # Rate limiting by IP
    ip_address = request.client.host if request.client else "unknown"
    
    recent_submissions = await db.contact_submissions.count_documents({
        "ip_address": ip_address,
        "created_at": {"$gt": datetime.now(timezone.utc) - timedelta(hours=1)}
    })
    
    if recent_submissions >= 5:
        raise HTTPException(status_code=429, detail="Too many submissions. Please try again later.")
    
    contact_dict = contact_data.model_dump()
    contact_dict['ip_address'] = ip_address
    contact_dict['user_agent'] = request.headers.get("user-agent")
    contact_dict['created_at'] = contact_dict['created_at'].isoformat()
    
    await db.contact_submissions.insert_one(contact_dict)
    
    # TODO: Send email notification
    # This would require email service configuration
    
    return contact_data

@api_router.get("/contact", response_model=List[ContactSubmission])
async def get_contact_submissions(
    auth_data: Dict[str, Any] = Depends(get_current_admin),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
):
    """Get contact submissions (admin only)"""
    query = {}
    if status:
        query["status"] = status
    
    submissions = await db.contact_submissions.find(query, {"_id": 0})\
        .sort("created_at", -1)\
        .skip(skip)\
        .limit(limit)\
        .to_list(limit)
    
    for submission in submissions:
        if isinstance(submission.get('created_at'), str):
            submission['created_at'] = datetime.fromisoformat(submission['created_at'])
    
    return submissions

@api_router.put("/contact/{contact_id}/status")
async def update_contact_status(
    contact_id: str,
    status: str = Body(..., embed=True),
    auth_data: Dict[str, Any] = Depends(get_current_admin)
):
    """Update contact submission status (admin only)"""
    result = await db.contact_submissions.update_one(
        {"id": contact_id},
        {"$set": {"status": status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Contact submission not found")
    
    # Log activity
    asyncio.create_task(log_activity(
        auth_data["user"]["id"],
        "update_contact_status",
        {"contact_id": contact_id, "status": status}
    ))
    
    return {"message": "Status updated successfully"}

# ==================== STATS ROUTES ====================

@api_router.get("/stats")
async def get_stats(auth_data: Dict[str, Any] = Depends(get_current_admin)):
    """Get system statistics (admin only)"""
    # Run all counts in parallel for better performance
    counts = await asyncio.gather(
        db.users.count_documents({"is_active": True}),
        db.sermons.count_documents({}),
        db.events.count_documents({"date": {"$gte": datetime.now(timezone.utc).isoformat()}}),
        db.blogs.count_documents({"published": True}),
        db.donations.count_documents({"status": "succeeded"}),
        db.contact_submissions.count_documents({"status": "new"})
    )
    
    # Get total donation amount
    pipeline = [
        {"$match": {"status": "succeeded"}},
        {"$group": {"_id": None, "total_amount": {"$sum": "$amount"}}}
    ]
    
    donation_result = await db.donations.aggregate(pipeline).to_list(1)
    total_amount = donation_result[0]["total_amount"] if donation_result else 0
    
    return {
        "users": counts[0],
        "sermons": counts[1],
        "upcoming_events": counts[2],
        "published_blogs": counts[3],
        "successful_donations": counts[4],
        "donation_amount": total_amount,
        "new_contact_submissions": counts[5]
    }

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {
        "message": "Heavenly Nature Ministry API",
        "status": "online",
        "version": "1.0.0",
        "environment": os.environ.get('ENVIRONMENT', 'development')
    }

@api_router.get("/health")
async def health_check():
    """Comprehensive health check"""
    checks = {}
    
    # Database check
    try:
        if db:
            await db.command('ping')
            checks['database'] = {"status": "healthy", "message": "Connected"}
        else:
            checks['database'] = {"status": "unhealthy", "message": "Not initialized"}
    except Exception as e:
        checks['database'] = {"status": "unhealthy", "message": str(e)}
    
    # Stripe check
    if stripe.api_key:
        try:
            # Simple check - verify API key by creating a small balance check
            stripe.Balance.retrieve()
            checks['stripe'] = {"status": "healthy", "message": "Connected"}
        except Exception as e:
            checks['stripe'] = {"status": "unhealthy", "message": str(e)}
    else:
        checks['stripe'] = {"status": "disabled", "message": "Not configured"}
    
    # Overall status
    all_healthy = all(check['status'] == 'healthy' for check in checks.values() 
                     if check['status'] != 'disabled')
    
    return {
        "status": "healthy" if all_healthy else "degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": checks
    }

# ==================== APP CONFIGURATION ====================

app.include_router(api_router)

# CORS configuration
cors_origins = os.environ.get('CORS_ORIGINS', '*').split(',')
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
if os.environ.get('ENVIRONMENT') == 'production':
    trusted_hosts = os.environ.get('TRUSTED_HOSTS', '').split(',')
    if trusted_hosts:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=trusted_hosts
        )

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
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
    logger.info("Starting Heavenly Nature Ministry API")
    
    if db:
        # Create database indexes
        await create_indexes()
        
        # Initialize admin user
        await initialize_admin_user()
        
        logger.info("Application startup completed")
    else:
        logger.error("Failed to initialize database connection")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Heavenly Nature Ministry API")
    if client:
        client.close()
        logger.info("Database connection closed")
