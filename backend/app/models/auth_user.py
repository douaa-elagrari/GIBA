from sqlalchemy import Column, Integer, String, Enum, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base


from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base


class AuthUser(Base):
    __tablename__ = "auth_user"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(Integer, ForeignKey("employee.id"), unique=True, nullable=False)

    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    is_verified = Column(Boolean, default=False)
    verification_code = Column(String(10))

    created_at = Column(TIMESTAMP, server_default=func.now())