from sqlalchemy import Column, Integer, String, Date
from app.database import Base


class Exercice(Base):
    __tablename__ = "exercice"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(20))
    date_debut = Column(Date)
    date_fin = Column(Date)
