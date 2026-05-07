from sqlalchemy import Column, Integer, Date, Time, Text, ForeignKey
from app.database import Base

class SortieRequest(Base):
    __tablename__ = "sortie_request"

    request_id = Column(Integer, ForeignKey("request.id"), primary_key=True)

    date_sortie = Column(Date)
    heure_sortie = Column(Time)
    heure_retour = Column(Time)
    motif = Column(Text)