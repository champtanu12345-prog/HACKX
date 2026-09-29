from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from backend.core.database import Base
from backend.models.base import TimestampMixin, generate_uuid


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=True, index=True)
    phone = Column(String(50), unique=True, nullable=True, index=True)
    name = Column(String(150), nullable=False, default="Maritime Officer")
    auth_provider = Column(String(50), nullable=False, default="official")  # google, phone, official
    service_id = Column(String(100), nullable=True, index=True)  # Service Number / ICG ID
    role = Column(String(100), nullable=False, default="Command Duty Officer")
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    last_login_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "phone": self.phone,
            "name": self.name,
            "auth_provider": self.auth_provider,
            "service_id": self.service_id,
            "role": self.role,
            "avatar_url": self.avatar_url,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None,
        }
