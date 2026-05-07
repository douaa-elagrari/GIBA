from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from app.database import Base

class AttestationTravail(Base):
    __tablename__ = "attestation_travail"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("employee.id"))
    date_naissance = Column(Date)
    adresse = Column(Text)
    num_secu = Column(String(100))
    date_embauche = Column(Date)
    poste = Column(String(100))