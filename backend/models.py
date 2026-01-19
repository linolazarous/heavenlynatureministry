from pydantic import BaseModel, Field, EmailStr, validator, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4
from bson import ObjectId

# =======================
# Pydantic Configurations
# =======================

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)

class MongoModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        from_attributes=True
    )

# =======================
# Enums
# =======================

class DonationCategory(str, Enum):
    GENERAL = "general"
    CHILDRENS_MINISTRY = "childrens_ministry"
    BUILDING_FUND = "building_fund"
    EMERGENCY = "emergency"
    MISSIONS = "missions"
    OUTREACH = "outreach"

class DonationFrequency(str, Enum):
    ONE_TIME = "one_time"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class PrayerStatus(str, Enum):
    PENDING = "pending"
    PRAYING = "praying"
    ANSWERED = "answered"
    UNANSWERED = "unanswered"

class EventRSVPStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    WAITLISTED = "waitlisted"

class UserRole(str, Enum):
    ADMIN = "admin"
    PASTOR = "pastor"
    VOLUNTEER = "volunteer"
    MEMBER = "member"
    GUEST = "guest"

class EventCategory(str, Enum):
    WORSHIP = "worship"
    BIBLE_STUDY = "bible_study"
    YOUTH = "youth"
    PRAYER = "prayer"
    COMMUNITY = "community"
    OUTREACH = "outreach"
    SPECIAL = "special"

# =======================
# Sermons
# =======================

class SermonCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, examples=["The Power of Faith"])
    speaker: str = Field(..., examples=["Pastor John Doe"])
    series: Optional[str] = Field(None, examples=["The Book of Romans"])
    description: str = Field(..., min_length=10, examples=["Exploring the depths of faith..."])
    scripture_reference: Optional[str] = Field(None, examples=["Romans 1:16-17"])
    date: datetime = Field(..., examples=["2024-01-15T10:30:00Z"])
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, ge=1, le=240, examples=[45])
    download_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list, examples=[["faith", "salvation", "grace"]])

    @validator('date')
    def validate_date_not_in_future(cls, v):
        if v > datetime.now(timezone.utc):
            raise ValueError('Sermon date cannot be in the future')
        return v

class SermonUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    speaker: Optional[str] = None
    series: Optional[str] = None
    description: Optional[str] = None
    scripture_reference: Optional[str] = None
    date: Optional[datetime] = None
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    download_url: Optional[str] = None
    tags: Optional[List[str]] = None

class Sermon(SermonCreate, MongoModel):
    id: PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    view_count: int = 0
    download_count: int = 0
    likes_count: int = 0

# =======================
# Events
# =======================

class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, examples=["Sunday Worship Service"])
    description: str = Field(..., min_length=10)
    location: str = Field(..., examples=["Main Sanctuary"])
    address: str = Field(..., examples=["123 Church St, City, State 12345"])
    latitude: float = Field(..., ge=-90, le=90, examples=[40.7128])
    longitude: float = Field(..., ge=-180, le=180, examples=[-74.0060])
    start_date: datetime = Field(...)
    end_date: datetime = Field(...)
    image_url: Optional[str] = None
    max_attendees: Optional[int] = Field(None, ge=1, examples=[200])
    registration_required: bool = False
    category: EventCategory = EventCategory.WORSHIP
    price: Optional[float] = Field(None, ge=0, examples=[0.0])

    @validator('end_date')
    def validate_dates(cls, v, values):
        if 'start_date' in values and v:
            if v <= values['start_date']:
                raise ValueError('end_date must be after start_date')
        return v

class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    image_url: Optional[str] = None
    max_attendees: Optional[int] = None
    registration_required: Optional[bool] = None
    category: Optional[EventCategory] = None
    price: Optional[float] = None

class Event(EventCreate, MongoModel):
    id: PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    attendees_count: int = 0
    waitlist_count: int = 0
    is_cancelled: bool = False

class EventRSVPCreate(BaseModel):
    event_id: str = Field(..., min_length=24, max_length=24)
    name: str = Field(..., examples=["John Doe"])
    email: EmailStr = Field(..., examples=["john@example.com"])
    phone: Optional[str] = Field(None, examples=["+1234567890"])
    number_of_attendees: int = Field(default=1, ge=1, le=10, examples=[2])
    special_requirements: Optional[str] = Field(None, examples=["Vegetarian meal required"])

class EventRSVP(EventRSVPCreate, MongoModel):
    id: PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")
    status: EventRSVPStatus = EventRSVPStatus.PENDING
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    rsvp_code: str = Field(default_factory=lambda: uuid4().hex[:8].upper())

# =======================
# Donations
# =======================

class DonationCreate(BaseModel):
    amount: float = Field(..., gt=0, le=1000000, examples=[100.00])
    currency: str = Field(default="USD", pattern="^[A-Z]{3}$")
    category: DonationCategory = DonationCategory.GENERAL
    frequency: DonationFrequency = DonationFrequency.ONE_TIME
    donor_name: Optional[str] = Field(None, examples=["John Doe"])
    donor_email: Optional[EmailStr] = Field(None, examples=["john@example.com"])
    donor_phone: Optional[str] = Field(None, examples=["+1234567890"])
    message: Optional[str] = Field(None, max_length=500, examples=["Thank you for your ministry"])
    anonymous: bool = False
    receipt_required: bool = True

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return round(v, 2)

class DonationUpdate(BaseModel):
    payment_status: Optional[str] = None
    stripe_session_id: Optional[str] = None
    stripe_payment_id: Optional[str] = None
    message: Optional[str] = None
    anonymous: Optional[bool] = None

class Donation(DonationCreate, MongoModel):
    id: PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")
    stripe_session_id: Optional[str] = None
    stripe_payment_id: Optional[str] = None
    payment_status: str = "pending"  # pending, succeeded, failed, refunded
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    receipt_sent: bool = False
    receipt_sent_at: Optional[datetime] = None

# =======================
# Prayer Requests
# =======================

class PrayerRequestCreate(BaseModel):
    name: Optional[str] = Field(None, examples=["Jane Smith"])
    email: Optional[EmailStr] = Field(None, examples=["jane@example.com"])
    phone: Optional[str] = Field(None, examples=["+1234567890"])
    request_text: str = Field(..., min_length=10, max_length=2000, 
                             examples=["Please pray for healing for my mother..."])
    category: str = Field(default="general", examples=["health", "family", "financial"])
    is_anonymous: bool = False
    public_sharing_allowed: bool = False
    contact_allowed: bool = False
    urgency_level: str = Field(default="normal", pattern="^(low|normal|high|urgent)$")

class PrayerRequestUpdate(BaseModel):
    status: Optional[PrayerStatus] = None
    testimony: Optional[str] = Field(None, max_length=2000)
    is_anonymous: Optional[bool] = None
    public_sharing_allowed: Optional[bool] = None

class PrayerRequest(PrayerRequestCreate, MongoModel):
    id: PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")
    status: PrayerStatus = PrayerStatus.PENDING
    testimony: Optional[str] = None
    prayed_by_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_prayed_at: Optional[datetime] = None

# =======================
# Volunteers
# =======================

class VolunteerCreate(BaseModel):
    first_name: str = Field(..., min_length=1, examples=["John"])
    last_name: str = Field(..., min_length=1, examples=["Doe"])
    email: EmailStr = Field(..., examples=["john@example.com"])
    phone: str = Field(..., examples=["+1234567890"])
    address: Optional[str] = Field(None, examples=["123 Main St, City, State 12345"])
    areas_of_interest: List[str] = Field(default_factory=list, 
                                        examples=[["worship", "youth", "outreach"]])
    availability: str = Field(..., examples=["Weekends", "Weekday evenings"])
    skills: Optional[str] = Field(None, examples=["Music, Teaching, Counseling"])
    experience: Optional[str] = Field(None, examples=["5 years as worship leader"])
    motivation: Optional[str] = Field(None, examples=["I want to serve the community"])
    emergency_contact: Optional[str] = Field(None, examples=["Mary Doe - 555-0123"])
    has_background_check: bool = False

    @validator('phone')
    def validate_phone(cls, v):
        # Basic phone validation - can be enhanced based on requirements
        if not v.replace('+', '').replace(' ', '').replace('-', '').isdigit():
            raise ValueError('Phone number must contain only digits and valid separators')
        return v

class VolunteerUpdate(BaseModel):
    status: Optional[str] = None
    areas_of_interest: Optional[List[str]] = None
    availability: Optional[str] = None
    skills: Optional[str] = None
    notes: Optional[str] = None

class Volunteer(VolunteerCreate, MongoModel):
    id: PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")
    status: str = "pending"  # pending, approved, active, inactive, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    notes: Optional[str] = None

# =======================
# Blog
# =======================

class BlogPostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, examples=["The Journey of Faith"])
    slug: str = Field(..., pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$", 
                     examples=["the-journey-of-faith"])
    author: str = Field(..., examples=["Pastor John"])
    content: str = Field(..., min_length=100, examples=["<p>Content here...</p>"])
    excerpt: Optional[str] = Field(None, max_length=300, 
                                  examples=["A brief summary of the post..."])
    featured_image: Optional[str] = None
    category: str = Field(default="general", examples=["faith", "family", "prayer"])
    tags: List[str] = Field(default_factory=list, examples=[["faith", "growth", "testimony"]])
    published: bool = False
    allow_comments: bool = True

class BlogPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None
    allow_comments: Optional[bool] = None

class BlogPost(BlogPostCreate, MongoModel):
    id: PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None
    view_count: int = 0
    comment_count: int = 0
    likes_count: int = 0

# =======================
# Resources
# =======================

class ResourceCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, examples=["Bible Study Guide"])
    description: str = Field(..., min_length=10, examples=["A comprehensive guide..."])
    category: str = Field(..., examples=["study", "music", "children"])
    file_url: Optional[str] = None
    external_link: Optional[str] = None
    file_type: Optional[str] = Field(None, examples=["pdf", "mp3", "mp4"])
    file_size_mb: Optional[float] = Field(None, ge=0, examples=[2.5])
    thumbnail_url: Optional[str] = None
    author: Optional[str] = Field(None, examples=["Pastor John"])
    language: str = Field(default="en", examples=["en", "es", "fr"])

class Resource(ResourceCreate, MongoModel):
    id: PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    download_count: int = 0
    is_featured: bool = False

# =======================
# Live Streams
# =======================

class LiveStreamCreate(BaseModel):
    title: str = Field(..., examples=["Sunday Morning Service"])
    description: str = Field(..., examples=["Join us for worship and word"])
    scheduled_start: datetime = Field(...)
    scheduled_end: Optional[datetime] = None
    thumbnail_url: Optional[str] = None
    youtube_stream_id: Optional[str] = None
    facebook_stream_id: Optional[str] = None
    vimeo_stream_id: Optional[str] = None

    @validator('scheduled_end')
    def validate_stream_end_time(cls, v, values):
        if v and 'scheduled_start' in values:
            if v <= values['scheduled_start']:
                raise ValueError('scheduled_end must be after scheduled_start')
        return v

class LiveStreamUpdate(BaseModel):
    status: Optional[str] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    youtube_stream_id: Optional[str] = None
    facebook_stream_id: Optional[str] = None
    vimeo_stream_id: Optional[str] = None

class LiveStream(LiveStreamCreate, MongoModel):
    id: PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")
    status: str = "scheduled"  # scheduled, live, ended, cancelled
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    viewer_count: int = 0
    peak_viewers: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    recording_url: Optional[str] = None

# =======================
# Chat Messages
# =======================

class ChatMessageCreate(BaseModel):
    stream_id: str = Field(..., min_length=24, max_length=24)
    user_name: str = Field(..., examples=["John D."])
    message: str = Field(..., min_length=1, max_length=500, examples=["Amen!"])
    is_prayer_request: bool = False

class ChatMessage(ChatMessageCreate, MongoModel):
    id: PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    moderated: bool = False
    user_id: Optional[str] = None

# =======================
# Users and Auth
# =======================

class UserCreate(BaseModel):
    email: EmailStr = Field(..., examples=["user@example.com"])
    password: str = Field(..., min_length=8, examples=["StrongPass123!"])
    full_name: str = Field(..., examples=["John Doe"])
    role: UserRole = UserRole.MEMBER
    phone: Optional[str] = Field(None, examples=["+1234567890"])
    address: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    member_since: Optional[datetime] = None

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v

class UserLogin(BaseModel):
    email: EmailStr = Field(..., examples=["user@example.com"])
    password: str = Field(..., examples=["StrongPass123!"])

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None
    notifications_enabled: Optional[bool] = None

class User(UserCreate, MongoModel):
    id: PyObjectId = Field(default_factory=lambda: PyObjectId(str(ObjectId())), alias="_id")
    is_active: bool = True
    is_verified: bool = False
    profile_picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None
    notifications_enabled: bool = True
    email_verified: bool = False

    # Remove password from response
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "full_name": "John Doe",
                "role": "member",
                "is_active": True
            }
        }
    )

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
    refresh_token: Optional[str] = None

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[str] = None

# =======================
# Ministry Info
# =======================

class MinistryInfo(BaseModel):
    name: str = Field(default="Heavenly Nature Ministry", examples=["Heavenly Nature Ministry"])
    slogan: str = Field(default="We are one", examples=["We are one"])
    email: str = Field(..., examples=["info@heavenlynatureministry.com"])
    phone: str = Field(..., examples=["+211 926 006 202"])
    whatsapp: str = Field(..., examples=["+211 926 006 202"])
    address: str = Field(..., examples=["Gudele 2 Joppa Block 3, Juba South Sudan"])
    latitude: float = Field(..., examples=[40.7128])
    longitude: float = Field(..., examples=[-74.0060])
    scripture: str = Field(default="John 17:22", examples=["John 17:22"])
    facebook_url: Optional[str] = None
    youtube_url: Optional[str] = None
    instagram_url: Optional[str] = None
    twitter_url: Optional[str] = None
    service_times: str = Field(default="Sundays: 9am & 1pm", 
                              examples=["Sundays: 9am & 1pm, Wednesdays: 7pm"])
    pastor_name: Optional[str] = Field(None, examples=["Pastor John Mundari"])

    @validator('email')
    def validate_ministry_email(cls, v):
        if not v or '@' not in v:
            raise ValueError('Valid email required')
        return v

class MinistryInfoUpdate(BaseModel):
    name: Optional[str] = None
    slogan: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    scripture: Optional[str] = None
    facebook_url: Optional[str] = None
    youtube_url: Optional[str] = None
    instagram_url: Optional[str] = None
    twitter_url: Optional[str] = None
    service_times: Optional[str] = None
    pastor_name: Optional[str] = None

# =======================
# Response Models
# =======================

class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    size: int
    pages: int

class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    details: Optional[dict] = None

# =======================
# Analytics
# =======================

class AnalyticsSummary(BaseModel):
    total_donations: float = 0.0
    total_prayer_requests: int = 0
    total_events: int = 0
    total_sermons: int = 0
    total_volunteers: int = 0
    active_streams: int = 0

class MonthlyDonation(BaseModel):
    month: str
    amount: float
    count: int
