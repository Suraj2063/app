from fastapi import APIRouter, Depends, Query
from datetime import date

from app.schemas.schemas import DashboardStats, UserResponse, BookingResponse, RestaurantResponse, PaginatedResponse, BookingStatusUpdate
from app.database import get_supabase
from app.utils.auth import get_current_admin
from app.utils.helpers import paginate

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(_: dict = Depends(get_current_admin)):
    db = get_supabase()
    today = date.today().isoformat()

    total_bookings_res = db.table("bookings").select("id", count="exact").execute()
    upcoming_res = db.table("bookings").select("id", count="exact").in_("status", ["pending", "confirmed"]).gte("booking_date", today).execute()
    completed_res = db.table("bookings").select("id", count="exact").eq("status", "completed").execute()
    cancelled_res = db.table("bookings").select("id", count="exact").eq("status", "cancelled").execute()
    restaurants_res = db.table("restaurants").select("id", count="exact").eq("is_active", True).execute()
    users_res = db.table("users").select("id", count="exact").execute()
    today_res = db.table("bookings").select("id", count="exact").eq("booking_date", today).execute()

    return DashboardStats(
        total_bookings=total_bookings_res.count or 0,
        upcoming_bookings=upcoming_res.count or 0,
        completed_bookings=completed_res.count or 0,
        cancelled_bookings=cancelled_res.count or 0,
        total_restaurants=restaurants_res.count or 0,
        total_users=users_res.count or 0,
        revenue_this_month=0.0,
        bookings_today=today_res.count or 0,
    )


@router.get("/users", response_model=PaginatedResponse)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    _: dict = Depends(get_current_admin),
):
    db = get_supabase()
    offset = (page - 1) * per_page
    result = db.table("users").select("*", count="exact").order("created_at", desc=True).range(offset, offset + per_page - 1).execute()
    return paginate(result.data or [], result.count or 0, page, per_page)


@router.get("/bookings", response_model=PaginatedResponse)
async def list_all_bookings(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    _: dict = Depends(get_current_admin),
):
    db = get_supabase()
    offset = (page - 1) * per_page
    result = db.table("bookings")\
        .select("*, restaurant:restaurants(*), table:tables(*), user:users(id,email,full_name,phone,role,created_at,updated_at)", count="exact")\
        .order("created_at", desc=True)\
        .range(offset, offset + per_page - 1)\
        .execute()
    return paginate(result.data or [], result.count or 0, page, per_page)


@router.get("/restaurants", response_model=PaginatedResponse)
async def list_all_restaurants(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    _: dict = Depends(get_current_admin),
):
    db = get_supabase()
    offset = (page - 1) * per_page
    result = db.table("restaurants").select("*", count="exact").order("created_at", desc=True).range(offset, offset + per_page - 1).execute()
    return paginate(result.data or [], result.count or 0, page, per_page)


@router.put("/bookings/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(booking_id: str, data: BookingStatusUpdate, _: dict = Depends(get_current_admin)):
    from datetime import datetime, timezone
    db = get_supabase()
    result = db.table("bookings").update({
        "status": data.status.value,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", booking_id).execute()
    if not result.data:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Booking not found")
    return result.data[0]
