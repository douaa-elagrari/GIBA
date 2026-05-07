from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.database import Base

class PlacementRequest(Base):
    __tablename__ = "placement_request"

    request_id = Column(Integer, ForeignKey("request.id"), primary_key=True)

    host_structure = Column(String(255))
    duration       = Column(String(100))
    conditions     = Column(Text)