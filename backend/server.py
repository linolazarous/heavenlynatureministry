"""
Heavenly Nature Ministry - Main FastAPI Server
Production-ready with security, monitoring, and proper error handling
"""

import os
import sys
import uuid
import logging
import asyncio
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

# FastAPI and dependencies
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

# Database
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

# Auth
from jose import JWTError, jwt
from passlib.context import CryptContext

# Email
import resend

# Environment
from dotenv import load_dotenv
from pydantic import ValidationError

# Custom models and utilities
from models import (
    UserCreate, UserLogin, Token, MinistryInfo,
    SuccessResponse, ErrorResponse, TokenData
)

# -------------------------------
# Configuration and Setup
# -------------------------------

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(ROOT_DIR / 'logs' / 'app.log') if os.getenv('LOG_TO_FILE', 'False').lower() == 'true' else logging.NullHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create logs directory if it doesn't exist
(ROOT_DIR / 'logs').mkdir(exist_ok=True)

# -------------------------------
# Configuration Constants
# -------------------------------

class Config:
    """Application configuration"""
    # App
    APP_NAME = os.getenv('APP_NAME', 'Heavenly Nature Ministry API')
    APP_VERSION = os.getenv('APP_VERSION', '1.0.0')
    APP_ENV = os.getenv('APP_ENV', 'production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # MongoDB
    MONGO_URL = os.getenv('MONGO_URL')
    DB_NAME = os.getenv('DB_NAME', 'heavenly_nature_ministry')
    MONGO_MAX_POOL_SIZE = int(os.getenv('MONGO_MAX_POOL_SIZE', 100))
    MONGO_MIN_POOL_SIZE = int(os.getenv('MONGO_MIN_POOL_SIZE', 10))
    
    # JWT
    JWT_SECRET = os.getenv('JWT_SECRET_KEY')
    JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
    JWT_ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRE_HOURS', 24))
    JWT_REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRE_DAYS', 30))
    
    # Security
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:8000').split(',')
    ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')
    RATE_LIMIT_ENABLED = os.getenv('RATE_LIMIT_ENABLED', 'True').lower() == 'true'
    RATE_LIMIT_PER_MINUTE = int(os.getenv('RATE_LIMIT_PER_MINUTE', 60))
    
    # Stripe
    STRIPE_API_KEY = os.getenv('STRIPE_API_KEY')
    STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')
    
    # Email
    RESEND_API_KEY = os.getenv('RESEND_API_KEY')
    SENDER_EMAIL = os.getenv('SENDER_EMAIL', 'noreply@heavenlynature.org')
    FROM_NAME = os.getenv('FROM_NAME', 'Heavenly Nature Ministry')
    
    # Ministry Info
    MINISTRY_EMAIL = os.getenv('MINISTRY_EMAIL', 'info@heavenlynature.org')
    MINISTRY_PHONE = os.getenv('MINISTRY_PHONE', '+211922273334')
    MINISTRY_WHATSAPP = os.getenv('MINISTRY_WHATSAPP', '+211922273334')
    MINISTRY_ADDRESS = os.getenv('MINISTRY_ADDRESS', 'Gudele 2, Joppa Block 3, Juba, South Sudan')
    MINISTRY_LAT = float(os.getenv('MINISTRY_LOCATION_LAT', 4.8517))
    MINISTRY_LNG = float(os.getenv('MINISTRY_LOCATION_LNG', 31.5825))
    
    # Admin
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')
    ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'Administrator')
    
    # API
    API_PREFIX = os.getenv('API_PREFIX', '/api')
    DOCS_URL = os.getenv('DOCS_URL', '/docs' if DEBUG else None)
    REDOC_URL = os.getenv('REDOC_URL', '/redoc' if DEBUG else None)
    
    # Cache
    CACHE_TTL = int(os.getenv('CACHE_TTL', 300))  # 5 minutes
    
    # Uploads
    MAX_UPLOAD_SIZE = int(os.getenv('MAX_UPLOAD_SIZE', 100 * 1024 * 1024))  # 100MB
    ALLOWED_FILE_TYPES = os.getenv('ALLOWED_FILE_TYPES', 'jpg,jpeg,png,pdf,mp3,mp4').split(',')


# Validate required configurations
if not Config.MONGO_URL:
    logger.error("MONGO_URL environment variable is required")
    sys.exit(1)

if not Config.JWT_SECRET:
    logger.error("JWT_SECRET_KEY environment variable is required")
    sys.exit(1)

if Config.APP_ENV == 'production' and not Config.ADMIN_EMAIL:
    logger.error("ADMIN_EMAIL environment variable is required in production")
    sys.exit(1)

# -------------------------------
# Database Connection
# -------------------------------

class DatabaseManager:
    """Manage database connections and operations"""
    
    def __init__(self):
        self.client = None
        self.db = None
    
    async def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(
                Config.MONGO_URL,
                maxPoolSize=Config.MONGO_MAX_POOL_SIZE,
                minPoolSize=Config.MONGO_MIN_POOL_SIZE,
                serverSelectionTimeoutMS=5000
            )
            
            # Test connection
            await self.client.admin.command('ping')
            self.db = self.client[Config.DB_NAME]
            
            # Create indexes
            await self.create_indexes()
            
            logger.info("Connected to MongoDB successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            return False
    
    async def create_indexes(self):
        """Create database indexes for performance"""
        try:
            # Users collection indexes
            await self.db.users.create_index("email", unique=True)
            await self.db.users.create_index("role")
            await self.db.users.create_index("created_at")
            
            # Sermons collection indexes
            await self.db.sermons.create_index("date")
            await self.db.sermons.create_index("speaker")
            await self.db.sermons.create_index("tags")
            
            # Events collection indexes
            await self.db.events.create_index("start_date")
            await self.db.events.create_index("category")
            await self.db.events.create_index("created_at")
            
            # Donations collection indexes
            await self.db.donations.create_index("created_at")
            await self.db.donations.create_index("payment_status")
            await self.db.donations.create_index("donor_email")
            
            # Prayer requests collection indexes
            await self.db.prayer_requests.create_index("created_at")
            await self.db.prayer_requests.create_index("status")
            await self.db.prayer_requests.create_index("category")
            
            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.error(f"Failed to create indexes: {str(e)}")
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")
    
    def get_database(self) -> AsyncIOMotorDatabase:
        """Get database instance"""
        if not self.db:
            raise RuntimeError("Database not connected")
        return self.db


# Global database manager instance
db_manager = DatabaseManager()

# -------------------------------
# Authentication
# -------------------------------

security = HTTPBearer(auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=Config.JWT_ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=Config.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """Get current authenticated user from JWT token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
        
        # Check token type
        token_type = payload.get("type")
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        db = db_manager.get_database()
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive"
            )
        
        return user
    
    except JWTError as e:
        logger.warning(f"JWT decode error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


async def get_current_admin_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get current authenticated admin user"""
    if current_user.get("role") not in ["admin", "pastor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or pastor access required"
        )
    return current_user


# -------------------------------
# Email Service
# -------------------------------

class EmailService:
    """Handle email sending with fallback mechanisms"""
    
    def __init__(self):
        if Config.RESEND_API_KEY:
            resend.api_key = Config.RESEND_API_KEY
            self.use_resend = True
        else:
            self.use_resend = False
            logger.warning("RESEND_API_KEY not set, email functionality limited")
    
    async def send_email(
        self,
        recipient: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email to recipient"""
        try:
            if self.use_resend:
                return await self._send_via_resend(recipient, subject, html_content, text_content)
            else:
                logger.warning("Email service not configured")
                return False
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
    
    async def _send_via_resend(
        self,
        recipient: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email using Resend API"""
        try:
            params = {
                "from": f"{Config.FROM_NAME} <{Config.SENDER_EMAIL}>",
                "to": [recipient],
                "subject": subject,
                "html": html_content,
            }
            
            if text_content:
                params["text"] = text_content
            
            # Run in thread pool to avoid blocking
            await asyncio.to_thread(resend.Emails.send, params)
            logger.info(f"Email sent to {recipient} via Resend")
            return True
        except Exception as e:
            logger.error(f"Resend API error: {str(e)}")
            return False


email_service = EmailService()

# -------------------------------
# API Router
# -------------------------------

api_router = APIRouter(prefix=Config.API_PREFIX)


@api_router.get("/", response_model=SuccessResponse)
async def root():
    """Root endpoint with API information"""
    return SuccessResponse(
        message=f"{Config.APP_NAME} - Version {Config.APP_VERSION}",
        data={
            "status": "running",
            "environment": Config.APP_ENV,
            "docs": Config.DOCS_URL,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )


@api_router.get("/health", response_model=SuccessResponse)
async def health_check():
    """Health check endpoint for monitoring"""
    db_status = "connected" if db_manager.db else "disconnected"
    
    return SuccessResponse(
        message="Service health status",
        data={
            "status": "healthy",
            "database": db_status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": Config.APP_VERSION
        }
    )


@api_router.get("/ministry/info", response_model=MinistryInfo)
async def get_ministry_info():
    """Get ministry information"""
    return MinistryInfo(
        email=Config.MINISTRY_EMAIL,
        phone=Config.MINISTRY_PHONE,
        whatsapp=Config.MINISTRY_WHATSAPP,
        address=Config.MINISTRY_ADDRESS,
        latitude=Config.MINISTRY_LAT,
        longitude=Config.MINISTRY_LNG,
        name=Config.APP_NAME,
        slogan="We are one",
        scripture="John 17:22"
    )


@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    db = db_manager.get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user = {
        "id": user_id,
        "email": user_data.email,
        "password": hashed_password,
        "full_name": user_data.full_name,
        "role": user_data.role.value,
        "is_active": True,
        "is_verified": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None
    }
    
    # Add phone and address if provided
    if hasattr(user_data, 'phone') and user_data.phone:
        user["phone"] = user_data.phone
    if hasattr(user_data, 'address') and user_data.address:
        user["address"] = user_data.address
    
    await db.users.insert_one(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    # Send welcome email
    welcome_subject = f"Welcome to {Config.APP_NAME}"
    welcome_html = f"""
    <h1>Welcome to {Config.APP_NAME}!</h1>
    <p>Thank you for registering. We're glad to have you as part of our community.</p>
    <p>You can now log in to access sermons, events, and other resources.</p>
    <br>
    <p>Blessings,</p>
    <p>The {Config.APP_NAME} Team</p>
    """
    
    asyncio.create_task(
        email_service.send_email(user_data.email, welcome_subject, welcome_html)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=Config.JWT_ACCESS_TOKEN_EXPIRE_HOURS * 3600
    )


@api_router.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    """Authenticate user and return JWT token"""
    db = db_manager.get_database()
    
    user = await db.users.find_one({"email": login_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive"
        )
    
    # Update last login
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"]})
    refresh_token = create_refresh_token(data={"sub": user["id"]})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=Config.JWT_ACCESS_TOKEN_EXPIRE_HOURS * 3600,
        refresh_token=refresh_token
    )


@api_router.post("/auth/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token"""
    try:
        payload = jwt.decode(refresh_token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
        
        token_type = payload.get("type")
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        db = db_manager.get_database()
        user = await db.users.find_one({"id": user_id})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Create new access token
        access_token = create_access_token(data={"sub": user_id})
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=Config.JWT_ACCESS_TOKEN_EXPIRE_HOURS * 3600
        )
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )


@api_router.get("/auth/me", response_model=SuccessResponse)
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get current user information"""
    # Remove sensitive data
    user_data = current_user.copy()
    user_data.pop("password", None)
    
    return SuccessResponse(
        message="User information retrieved successfully",
        data=user_data
    )


# -------------------------------
# Admin Endpoints
# -------------------------------

@api_router.get("/admin/dashboard", response_model=SuccessResponse)
async def admin_dashboard(
    admin_user: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Admin dashboard with statistics"""
    db = db_manager.get_database()
    
    # Get counts (run in parallel)
    users_count = await db.users.count_documents({})
    sermons_count = await db.sermons.count_documents({})
    events_count = await db.events.count_documents({})
    prayer_requests_count = await db.prayer_requests.count_documents({})
    donations_count = await db.donations.count_documents({"payment_status": "succeeded"})
    
    # Get recent activity
    recent_users = await db.users.find(
        {},
        {"_id": 0, "email": 1, "full_name": 1, "created_at": 1, "role": 1}
    ).sort("created_at", -1).limit(5).to_list(length=5)
    
    recent_prayers = await db.prayer_requests.find(
        {},
        {"_id": 0, "request_text": 1, "created_at": 1, "status": 1}
    ).sort("created_at", -1).limit(5).to_list(length=5)
    
    return SuccessResponse(
        message="Admin dashboard data",
        data={
            "counts": {
                "users": users_count,
                "sermons": sermons_count,
                "events": events_count,
                "prayer_requests": prayer_requests_count,
                "donations": donations_count
            },
            "recent_activity": {
                "users": recent_users,
                "prayer_requests": recent_prayers
            }
        }
    )


# -------------------------------
# Application Lifespan Management
# -------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown events"""
    # Startup
    logger.info(f"Starting {Config.APP_NAME} v{Config.APP_VERSION} in {Config.APP_ENV} mode")
    
    # Connect to database
    if await db_manager.connect():
        # Create admin user if not exists
        await create_admin_user()
        logger.info("Application startup complete")
    else:
        logger.error("Failed to connect to database, application may not function properly")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    await db_manager.disconnect()
    logger.info("Application shutdown complete")


# -------------------------------
# Create Admin User
# -------------------------------

async def create_admin_user():
    """Create initial admin user if it doesn't exist"""
    if not Config.ADMIN_EMAIL or not Config.ADMIN_PASSWORD:
        logger.warning("Admin credentials not provided, skipping admin user creation")
        return
    
    db = db_manager.get_database()
    existing_admin = await db.users.find_one({"email": Config.ADMIN_EMAIL})
    
    if not existing_admin:
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(Config.ADMIN_PASSWORD)
        
        admin_user = {
            "id": user_id,
            "email": Config.ADMIN_EMAIL,
            "password": hashed_password,
            "full_name": Config.ADMIN_USERNAME,
            "role": "admin",
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "last_login": None
        }
        
        await db.users.insert_one(admin_user)
        logger.info(f"Admin user created: {Config.ADMIN_EMAIL}")
    else:
        logger.info(f"Admin user already exists: {Config.ADMIN_EMAIL}")


# -------------------------------
# Exception Handlers
# -------------------------------

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error="Validation error",
            details={"errors": errors}
        ).dict()
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail,
            details=getattr(exc, "details", None)
        ).dict()
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    # Don't expose internal errors in production
    if Config.APP_ENV == "production":
        error_message = "Internal server error"
    else:
        error_message = str(exc)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error=error_message,
            details={"type": exc.__class__.__name__} if Config.DEBUG else None
        ).dict()
    )


# -------------------------------
# Create FastAPI App
# -------------------------------

def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    # Custom OpenAPI schema
    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema
        
        openapi_schema = get_openapi(
            title=Config.APP_NAME,
            version=Config.APP_VERSION,
            description="""
            Heavenly Nature Ministry API
            
            This API provides endpoints for managing church operations including:
            - Sermons and media
            - Events and registrations
            - Donations and payments
            - Prayer requests
            - Volunteer management
            - Blog posts and resources
            - Live streaming
            """,
            routes=app.routes,
        )
        
        # Add security schemes
        openapi_schema["components"]["securitySchemes"] = {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT"
            }
        }
        
        # Add security requirements
        for path in openapi_schema["paths"].values():
            for method in path.values():
                method["security"] = [{"BearerAuth": []}]
        
        app.openapi_schema = openapi_schema
        return app.openapi_schema
    
    # Create app with lifespan
    app = FastAPI(
        title=Config.APP_NAME,
        version=Config.APP_VERSION,
        docs_url=Config.DOCS_URL,
        redoc_url=Config.REDOC_URL,
        openapi_url="/openapi.json" if Config.DEBUG else None,
        lifespan=lifespan,
        default_response_class=JSONResponse
    )
    
    # Custom docs endpoint for production
    if not Config.DEBUG and Config.DOCS_URL:
        @app.get(Config.DOCS_URL, include_in_schema=False)
        async def custom_swagger_ui_html():
            return get_swagger_ui_html(
                openapi_url="/openapi.json",
                title=f"{Config.APP_NAME} - Swagger UI",
                swagger_favicon_url="https://fastapi.tiangolo.com/img/favicon.png"
            )
    
    # Set custom OpenAPI
    app.openapi = custom_openapi
    
    # Register exception handlers
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
    
    # Add middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=Config.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["Content-Range", "X-Total-Count"]
    )
    
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=Config.ALLOWED_HOSTS if Config.ALLOWED_HOSTS != ["*"] else None
    )
    
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Add request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = datetime.now(timezone.utc)
        
        # Skip logging for health checks
        if request.url.path.endswith("/health"):
            response = await call_next(request)
            return response
        
        logger.info(f"Request: {request.method} {request.url.path}")
        
        response = await call_next(request)
        
        process_time = (datetime.now(timezone.utc) - start_time).total_seconds() * 1000
        logger.info(f"Response: {response.status_code} - {process_time:.2f}ms")
        
        return response
    
    # Include API router
    app.include_router(api_router)
    
    return app


# Create the application instance
app = create_app()

# -------------------------------
# Main Entry Point
# -------------------------------

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=Config.DEBUG,
        log_level="info",
        access_log=False  # We handle logging in middleware
    )
