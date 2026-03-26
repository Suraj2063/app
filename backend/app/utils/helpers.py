import random
import string
from datetime import datetime, timezone


def generate_confirmation_code(length: int = 8) -> str:
    """Generate a unique booking confirmation code."""
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=length))


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


def paginate(items: list, total: int, page: int, per_page: int) -> dict:
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, -(-total // per_page)),  # ceiling division
    }
