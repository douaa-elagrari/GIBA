from sqlalchemy import Column, Integer, Date, ForeignKey
from app.database import Base

class TitreConge(Base):
    __tablename__ = "titre_conge"

    id = Column(Integer, primary_key=True, index=True)
    conge_request_id = Column(Integer, ForeignKey("conge_request.request_id"))

    exercice = Column(Integer)
    duree = Column(Integer)
    date_reprise = Column(Date)
    reliquat = Column(Integer)