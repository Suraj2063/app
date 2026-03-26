from fastapi import APIRouter, HTTPException, Depends

from app.schemas.schemas import TableUpdate, TableResponse
from app.database import get_supabase
from app.utils.auth import get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/tables", tags=["Tables"])


@router.put("/{table_id}", response_model=TableResponse)
async def update_table(table_id: str, data: TableUpdate, current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    table = db.table("tables").select("*, restaurant:restaurants(owner_id)").eq("id", table_id).single().execute()
    if not table.data:
        raise HTTPException(status_code=404, detail="Table not found")

    if current_user["role"] != "admin" and table.data.get("restaurant", {}).get("owner_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = db.table("tables").update(update_data).eq("id", table_id).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update table")
    return result.data[0]


@router.delete("/{table_id}", status_code=204)
async def delete_table(table_id: str, current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    table = db.table("tables").select("*, restaurant:restaurants(owner_id)").eq("id", table_id).single().execute()
    if not table.data:
        raise HTTPException(status_code=404, detail="Table not found")

    if current_user["role"] != "admin" and table.data.get("restaurant", {}).get("owner_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.table("tables").delete().eq("id", table_id).execute()
