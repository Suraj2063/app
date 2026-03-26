from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator
from enum import Enum


class UserRole(str, Enum):
    customer = "customer"
    admin = "admin"
    restaurant_owner = "restaurant_owner"


class BookingStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"
    no_show = "no_show"


class TableStatus(str, Enum):
    available = "available"
    occupied = "occupied"
    reserved = "reserved"
    maintenance = "maintenance"


class TableLocation(str, Enum):
    indoor = "indoor"
    outdoor = "outdoor"
    bar = "bar"
    private = "private"


# ─── User Schemas ────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserResponse(UserBase):
    id: str
    role: UserRole
    created_at: datetime
    updated_at: datetime


# ─── Restaurant Schemas ───────────────────────────────────────────────────────

class RestaurantBase(BaseModel):
    name: str
    description: str
    cuisine_type: str
    address: str
    city: str
    state: str
    zip_code: str
    country: str = "US"
    phone: str
    email: EmailStr
    website: Optional[str] = None
    image_url: Optional[str] = None
    opening_time: str
    closing_time: str
    days_open: List[str]
    price_range: int

    @field_validator("price_range")
    @classmethod
    def valid_price_range(cls, v: int) -> int:
        if v not in (1, 2, 3, 4):
            raise ValueError("Price range must be between 1 and 4")
        return v


class RestaurantCreate(RestaurantBase):
    pass


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cuisine_type: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    image_url: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    days_open: Optional[List[str]] = None
    price_range: Optional[int] = None
    is_active: Optional[bool] = None


class RestaurantResponse(RestaurantBase):
    id: str
    rating: float
    review_count: int
    is_active: bool
    owner_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ─── Table Schemas ────────────────────────────────────────────────────────────

class TableBase(BaseModel):
    table_number: str
    capacity: int
    location: TableLocation
    min_capacity: Optional[int] = None
    description: Optional[str] = None


class TableCreate(TableBase):
    pass


class TableUpdate(BaseModel):
    table_number: Optional[str] = None
    capacity: Optional[int] = None
    location: Optional[TableLocation] = None
    status: Optional[TableStatus] = None
    min_capacity: Optional[int] = None
    description: Optional[str] = None


class TableResponse(TableBase):
    id: str
    restaurant_id: str
    status: TableStatus
    created_at: datetime
    updated_at: datetime


# ─── Booking Schemas ──────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    restaurant_id: str
    table_id: str
    booking_date: str
    booking_time: str
    party_size: int
    special_requests: Optional[str] = None

    @field_validator("party_size")
    @classmethod
    def valid_party_size(cls, v: int) -> int:
        if v < 1 or v > 20:
            raise ValueError("Party size must be between 1 and 20")
        return v


class BookingUpdate(BaseModel):
    booking_date: Optional[str] = None
    booking_time: Optional[str] = None
    party_size: Optional[int] = None
    special_requests: Optional[str] = None
    status: Optional[BookingStatus] = None


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingResponse(BaseModel):
    id: str
    user_id: str
    restaurant_id: str
    table_id: str
    booking_date: str
    booking_time: str
    party_size: int
    status: BookingStatus
    special_requests: Optional[str] = None
    confirmation_code: str
    created_at: datetime
    updated_at: datetime
    restaurant: Optional[RestaurantResponse] = None
    table: Optional[TableResponse] = None
    user: Optional[UserResponse] = None


# ─── Review Schemas ───────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None
    booking_id: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def valid_rating(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewResponse(BaseModel):
    id: str
    user_id: str
    restaurant_id: str
    booking_id: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None


# ─── Pagination & Auth ────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    per_page: int
    pages: int


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class DashboardStats(BaseModel):
    total_bookings: int
    upcoming_bookings: int
    completed_bookings: int
    cancelled_bookings: int
    total_restaurants: int
    total_users: int
    revenue_this_month: float
    bookings_today: int
