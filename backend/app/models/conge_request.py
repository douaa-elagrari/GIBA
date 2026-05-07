
from sqlalchemy import Column, Integer, String, Date, Enum, Text, ForeignKey
from app.database import Base

class CongeRequest(Base):
    __tablename__ = "conge_request"

    request_id = Column(Integer, ForeignKey("request.id"), primary_key=True)
    # Added 'maladie' and 'exceptionnel' to the Enum
    type_conge = Column(Enum("annuel", "recuperation", "sans_solde", "autre"))
    date_debut = Column(Date)
    date_fin = Column(Date)
    nb_jours = Column(Integer)
    interim = Column(String(100), nullable=True)
    adresse = Column(Text, nullable=True)
    motif = Column(Text, nullable=True) 
    document_path = Column(String(255), nullable=True) # for certificates