from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, timezone
from typing import Optional

from app.schemas.schemas import (
    RestaurantCreate, RestaurantUpdate, RestaurantResponse,
    TableCreate, TableResponse, ReviewCreate, ReviewResponse, PaginatedResponse
)
from app.database import get_supabase
from app.utils.auth import get_current_user
from app.utils.helpers import paginate

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


@router.get("", response_model=PaginatedResponse)
async def list_restaurants(
    search: Optional[str] = None,
    cuisine_type: Optional[str] = None,
    city: Optional[str] = None,
    price_range: Optional[int] = None,
    min_rating: Optional[float] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=100),
):
    db = get_supabase()
    query = db.table("restaurants").select("*", count="exact").eq("is_active", True)

    if search:
        query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%,cuisine_type.ilike.%{search}%,city.ilike.%{search}%")
    if cuisine_type:
        query = query.eq("cuisine_type", cuisine_type)
    if city:
        query = query.ilike("city", f"%{city}%")
    if price_range:
        query = query.eq("price_range", price_range)
    if min_rating:
        query = query.gte("rating", min_rating)

    offset = (page - 1) * per_page
    result = query.order("rating", desc=True).range(offset, offset + per_page - 1).execute()

    return paginate(result.data or [], result.count or 0, page, per_page)


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(restaurant_id: str):
    db = get_supabase()
    result = db.table("restaurants").select("*").eq("id", restaurant_id).eq("is_active", True).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return result.data


@router.post("", response_model=RestaurantResponse, status_code=201)
async def create_restaurant(data: RestaurantCreate, current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    now = datetime.now(timezone.utc).isoformat()
    result = db.table("restaurants").insert({
        **data.model_dump(),
        "owner_id": current_user["id"],
        "rating": 0.0,
        "review_count": 0,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create restaurant")
    return result.data[0]


@router.put("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(restaurant_id: str, data: RestaurantUpdate, current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    restaurant = db.table("restaurants").select("*").eq("id", restaurant_id).single().execute()
    if not restaurant.data:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if current_user["role"] not in ("admin",) and restaurant.data["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this restaurant")

    update_data = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = db.table("restaurants").update(update_data).eq("id", restaurant_id).execute()
    return result.data[0]


@router.delete("/{restaurant_id}", status_code=204)
async def delete_restaurant(restaurant_id: str, current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    restaurant = db.table("restaurants").select("owner_id").eq("id", restaurant_id).single().execute()
    if not restaurant.data:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if current_user["role"] != "admin" and restaurant.data["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.table("restaurants").delete().eq("id", restaurant_id).execute()


@router.get("/{restaurant_id}/tables", response_model=list[TableResponse])
async def get_tables(restaurant_id: str):
    db = get_supabase()
    result = db.table("tables").select("*").eq("restaurant_id", restaurant_id).execute()
    return result.data or []


@router.get("/{restaurant_id}/available-tables", response_model=list[TableResponse])
async def get_available_tables(
    restaurant_id: str,
    date: str,
    time: str,
    party_size: int = Query(1, ge=1),
):
    db = get_supabase()

    # Get all tables for this restaurant
    tables_result = db.table("tables").select("*")\
        .eq("restaurant_id", restaurant_id)\
        .eq("status", "available")\
        .gte("capacity", party_size)\
        .execute()

    if not tables_result.data:
        return []

    # Get booked table IDs for this date/time
    booked_result = db.table("bookings").select("table_id")\
        .eq("restaurant_id", restaurant_id)\
        .eq("booking_date", date)\
        .eq("booking_time", time)\
        .in_("status", ["pending", "confirmed"])\
        .execute()

    booked_table_ids = {b["table_id"] for b in (booked_result.data or [])}
    available = [t for t in tables_result.data if t["id"] not in booked_table_ids]
    return available


@router.post("/{restaurant_id}/tables", response_model=TableResponse, status_code=201)
async def create_table(restaurant_id: str, data: TableCreate, current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    now = datetime.now(timezone.utc).isoformat()
    result = db.table("tables").insert({
        **data.model_dump(),
        "restaurant_id": restaurant_id,
        "status": "available",
        "created_at": now,
        "updated_at": now,
    }).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create table")
    return result.data[0]


@router.get("/{restaurant_id}/reviews", response_model=list[ReviewResponse])
async def get_reviews(restaurant_id: str):
    db = get_supabase()
    result = db.table("reviews").select("*, user:users(id,email,full_name,phone,role,created_at,updated_at)")\
        .eq("restaurant_id", restaurant_id)\
        .order("created_at", desc=True)\
        .execute()
    return result.data or []


@router.post("/{restaurant_id}/reviews", response_model=ReviewResponse, status_code=201)
async def create_review(restaurant_id: str, data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    db = get_supabase()

    # Check for existing review from this user
    existing = db.table("reviews").select("id").eq("restaurant_id", restaurant_id).eq("user_id", current_user["id"]).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="You have already reviewed this restaurant")

    now = datetime.now(timezone.utc).isoformat()
    result = db.table("reviews").insert({
        **data.model_dump(),
        "restaurant_id": restaurant_id,
        "user_id": current_user["id"],
        "created_at": now,
        "updated_at": now,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create review")

    # Update restaurant rating
    all_reviews = db.table("reviews").select("rating").eq("restaurant_id", restaurant_id).execute()
    if all_reviews.data:
        avg_rating = sum(r["rating"] for r in all_reviews.data) / len(all_reviews.data)
        db.table("restaurants").update({
            "rating": round(avg_rating, 2),
            "review_count": len(all_reviews.data),
            "updated_at": now,
        }).eq("id", restaurant_id).execute()

    return result.data[0]
