from sqlalchemy import Column, Integer, ForeignKey
from app.database import Base


class CongeAllocation(Base):
    __tablename__ = "conge_allocation"

    id = Column(Integer, primary_key=True, index=True)
    conge_request_id = Column(Integer, ForeignKey("conge_request.request_id"))
    exercice_id = Column(Integer, ForeignKey("exercice.id"))
    days_allocated = Column(Integer)
