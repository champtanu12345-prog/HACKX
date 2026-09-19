import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "HACKX Oil Spill Intelligence"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "sqlite:///./hackx.db"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Providers & Synthetic Data
    ENABLE_SYNTHETIC_DATA: bool = True
    COPERNICUS_API_USER: str = ""
    COPERNICUS_API_PASSWORD: str = ""
    SPIRE_AIS_API_KEY: str = ""
    NOAA_GFS_API_URL: str = "https://nomads.ncep.noaa.gov/dods/gfs_0p25"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
