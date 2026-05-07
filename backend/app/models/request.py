from sqlalchemy import Column, Integer, String, Enum, ForeignKey, TIMESTAMP, Text
from sqlalchemy.sql import func
from app.database import Base

class Request(Base):
    __tablename__ = "request"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("employee.id"), nullable=False)

    type = Column(Enum("sortie", "conge", "mission", "formation","placement"))
    status = Column(Enum("pending", "approved", "rejected"), default="pending")

    responsible_comments = Column(Text, nullable=True)  

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=True)
    finished_at = Column(TIMESTAMP, nullable=True)