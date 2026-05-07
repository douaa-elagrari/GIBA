from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from app.database import Base

class MissionRequest(Base):
    __tablename__ = "mission_request"

    request_id = Column(Integer, ForeignKey("request.id"), primary_key=True)

    destination = Column(String(255))
    objet = Column(Text)
    itineraire = Column(Text)
    duree = Column(Integer)
    date_depart = Column(Date)
    date_retour = Column(Date)
    transport = Column(String(100))