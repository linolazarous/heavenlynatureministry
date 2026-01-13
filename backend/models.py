from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum

# =======================
# Enums
# =======================

class DonationCategory(str, Enum):
    GENERAL = "general"
    CHILDRENS_MINISTRY = "childrens_ministry"
    BUILDING_FUND = "building_fund"
    EMERGENCY = "emergency"

class DonationFrequency(str, Enum):
    ONE_TIME = "one_time"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class PrayerStatus(str, Enum):
    PENDING = "pending"
    PRAYING = "praying"
    ANSWERED = "answered"

class EventRSVPStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"

class UserRole(str, Enum):
    ADMIN = "admin"
    VOLUNTEER = "volunteer"
    MEMBER = "member"

# =======================
# Sermons
# =======================

class SermonCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    speaker: str
    series: Optional[str] = None
    description: str
    scripture_reference: Optional[str] = None
    date: datetime
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    download_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

class Sermon(SermonCreate):
    id: str
    created_at: datetime
    updated_at: datetime
    view_count: int = 0
    download_count: int = 0

# =======================
# Events
# =======================

class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str
    location: str
    address: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    start_date: datetime
    end_date: datetime
    image_url: Optional[str] = None
    max_attendees: Optional[int] = None
    registration_required: bool = False
    category: str = "general"

class Event(EventCreate):
    id: str
    created_at: datetime
    updated_at: datetime
    attendees_count: int = 0

class EventRSVPCreate(BaseModel):
    event_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    number_of_attendees: int = Field(default=1, ge=1)

class EventRSVP(EventRSVPCreate):
    id: str
    status: EventRSVPStatus = EventRSVPStatus.PENDING
    created_at: datetime

# =======================
# Donations
# =======================

class DonationCreate(BaseModel):
    amount: float = Field(..., gt=0)
    currency: str = Field(default="usd")
    category: DonationCategory
    frequency: DonationFrequency = DonationFrequency.ONE_TIME
    donor_name: Optional[str] = None
    donor_email: Optional[EmailStr] = None
    donor_phone: Optional[str] = None
    message: Optional[str] = None
    anonymous: bool = False

class Donation(DonationCreate):
    id: str
    stripe_session_id: Optional[str] = None
    stripe_payment_id: Optional[str] = None
    payment_status: str = "pending"
    created_at: datetime
    updated_at: datetime

# =======================
# Prayer Requests
# =======================

class PrayerRequestCreate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    request_text: str = Field(..., min_length=10)
    category: str = "general"
    is_anonymous: bool = False
    public_sharing_allowed: bool = False

class PrayerRequest(PrayerRequestCreate):
    id: str
    status: PrayerStatus = PrayerStatus.PENDING
    testimony: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# =======================
# Volunteers
# =======================

class VolunteerCreate(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    phone: str
    address: Optional[str] = None
    areas_of_interest: List[str] = Field(default_factory=list)
    availability: str
    skills: Optional[str] = None
    experience: Optional[str] = None
    motivation: Optional[str] = None

class Volunteer(VolunteerCreate):
    id: str
    status: str = "pending"
    created_at: datetime
    updated_at: datetime

# =======================
# Blog
# =======================

class BlogPostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    slug: str
    author: str
    content: str = Field(..., min_length=100)
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    category: str = "general"
    tags: List[str] = Field(default_factory=list)
    published: bool = False

class BlogPost(BlogPostCreate):
    id: str
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    view_count: int = 0

# =======================
# Resources
# =======================

class ResourceCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str
    category: str
    file_url: Optional[str] = None
    external_link: Optional[str] = None
    file_type: Optional[str] = None
    file_size_mb: Optional[float] = None
    thumbnail_url: Optional[str] = None

class Resource(ResourceCreate):
    id: str
    created_at: datetime
    download_count: int = 0

# =======================
# Live Streams
# =======================

class LiveStreamCreate(BaseModel):
    title: str
    description: str
    scheduled_start: datetime
    thumbnail_url: Optional[str] = None
    youtube_stream_id: Optional[str] = None
    facebook_stream_id: Optional[str] = None

class LiveStream(LiveStreamCreate):
    id: str
    status: str = "scheduled"
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    viewer_count: int = 0
    created_at: datetime
    updated_at: datetime

# =======================
# Chat Messages
# =======================

class ChatMessage(BaseModel):
    stream_id: str
    user_name: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))  # UTC
    is_prayer_request: bool = False
    moderated: bool = False

# =======================
# Users and Auth
# =======================

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    role: UserRole = UserRole.MEMBER

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# =======================
# Ministry Info
# =======================

class MinistryInfo(BaseModel):
    name: str = "Heavenly Nature Ministry"
    slogan: str = "We are one"
    email: str
    phone: str
    whatsapp: str
    address: str
    latitude: float
    longitude: float
    scripture: str = "John 17:22"
