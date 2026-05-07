from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base

class OrdreMission(Base):
    __tablename__ = "ordre_mission"

    id = Column(Integer, primary_key=True, index=True)
    mission_request_id = Column(Integer, ForeignKey("mission_request.request_id"))

    reference = Column(String(100))
    date_emission = Column(Date)