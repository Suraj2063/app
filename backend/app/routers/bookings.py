from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, timezone
import asyncio

from app.schemas.schemas import BookingCreate, BookingUpdate, BookingResponse, PaginatedResponse
from app.database import get_supabase
from app.utils.auth import get_current_user
from app.utils.helpers import generate_confirmation_code, paginate
from app.utils.email import send_booking_confirmation, send_booking_cancellation

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingResponse, status_code=201)
async def create_booking(data: BookingCreate, current_user: dict = Depends(get_current_user)):
    db = get_supabase()

    # Check table exists and belongs to restaurant
    table = db.table("tables").select("*").eq("id", data.table_id).eq("restaurant_id", data.restaurant_id).single().execute()
    if not table.data:
        raise HTTPException(status_code=404, detail="Table not found")

    if table.data["capacity"] < data.party_size:
        raise HTTPException(status_code=400, detail=f"Table capacity ({table.data['capacity']}) is less than party size ({data.party_size})")

    # Check for conflicting bookings
    conflict = db.table("bookings").select("id")\
        .eq("table_id", data.table_id)\
        .eq("booking_date", data.booking_date)\
        .eq("booking_time", data.booking_time)\
        .in_("status", ["pending", "confirmed"])\
        .execute()

    if conflict.data:
        raise HTTPException(status_code=409, detail="This table is already booked at the requested time")

    confirmation_code = generate_confirmation_code()
    now = datetime.now(timezone.utc).isoformat()

    result = db.table("bookings").insert({
        "user_id": current_user["id"],
        "restaurant_id": data.restaurant_id,
        "table_id": data.table_id,
        "booking_date": data.booking_date,
        "booking_time": data.booking_time,
        "party_size": data.party_size,
        "special_requests": data.special_requests,
        "status": "confirmed",
        "confirmation_code": confirmation_code,
        "created_at": now,
        "updated_at": now,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create booking")

    booking = result.data[0]

    # Fetch related data
    restaurant = db.table("restaurants").select("*").eq("id", data.restaurant_id).single().execute()
    booking["restaurant"] = restaurant.data
    booking["table"] = table.data
    booking["user"] = current_user

    # Send confirmation email async
    if restaurant.data:
        asyncio.create_task(send_booking_confirmation(
            current_user["email"],
            current_user["full_name"],
            booking,
            restaurant.data,
        ))

    return booking


@router.get("", response_model=PaginatedResponse)
async def list_bookings(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    db = get_supabase()
    offset = (page - 1) * per_page

    result = db.table("bookings")\
        .select("*, restaurant:restaurants(*), table:tables(*), user:users(id,email,full_name,phone,role,created_at,updated_at)", count="exact")\
        .eq("user_id", current_user["id"])\
        .order("booking_date", desc=True)\
        .range(offset, offset + per_page - 1)\
        .execute()

    return paginate(result.data or [], result.count or 0, page, per_page)


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    result = db.table("bookings")\
        .select("*, restaurant:restaurants(*), table:tables(*), user:users(id,email,full_name,phone,role,created_at,updated_at)")\
        .eq("id", booking_id)\
        .single()\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking = result.data
    if booking["user_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return booking


@router.put("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    booking = db.table("bookings").select("*").eq("id", booking_id).single().execute()

    if not booking.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.data["user_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    if booking.data["status"] in ("cancelled", "completed"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel a {booking.data['status']} booking")

    now = datetime.now(timezone.utc).isoformat()
    result = db.table("bookings").update({
        "status": "cancelled",
        "updated_at": now,
    }).eq("id", booking_id).execute()

    updated_booking = result.data[0]
    restaurant = db.table("restaurants").select("*").eq("id", updated_booking["restaurant_id"]).single().execute()
    updated_booking["restaurant"] = restaurant.data
    updated_booking["user"] = current_user

    # Send cancellation email async
    if restaurant.data:
        asyncio.create_task(send_booking_cancellation(
            current_user["email"],
            current_user["full_name"],
            updated_booking,
            restaurant.data,
        ))

    return updated_booking


@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(booking_id: str, data: BookingUpdate, current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    booking = db.table("bookings").select("*").eq("id", booking_id).single().execute()

    if not booking.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.data["user_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    if data.status:
        update_data["status"] = data.status.value
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = db.table("bookings").update(update_data).eq("id", booking_id).execute()
    return result.data[0]
