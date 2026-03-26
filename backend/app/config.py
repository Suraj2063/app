from pydantic_settings import BaseSettings
from typing import List
import sys


class Settings(BaseSettings):
    # App
    APP_NAME: str = "TableEase API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # JWT
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@tableease.com"
    EMAIL_FROM_NAME: str = "TableEase"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# Warn if using default insecure secret key in a non-debug environment
_INSECURE_DEFAULT_KEY = "change-this-secret-key-in-production"
if not settings.DEBUG and settings.SECRET_KEY == _INSECURE_DEFAULT_KEY:
    print(
        "CRITICAL: SECRET_KEY is set to the default insecure value. "
        "Set a strong, unique SECRET_KEY environment variable before deploying to production.",
        file=sys.stderr,
    )
    sys.exit(1)
