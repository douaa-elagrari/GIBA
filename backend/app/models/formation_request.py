from sqlalchemy import Column, Integer, String, Date, Enum, Text, ForeignKey
from app.database import Base

class FormationRequest(Base):
    __tablename__ = "formation_request"

    request_id = Column(Integer, ForeignKey("request.id"), primary_key=True)

    theme = Column(String(255))
    type_formation = Column(Enum("courte","moyenne","longue"))
    periode = Column(String(100))
    objectifs = Column(Text)