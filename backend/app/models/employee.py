from sqlalchemy import Column, Integer, String, Date, Enum
from app.database import Base


class Employee(Base):
    __tablename__ = "employee"

    # --------------------
    # CORE
    # --------------------
    id = Column(Integer, primary_key=True, index=True)
    matricule = Column(String(50), unique=True)

    nom = Column(String(100))
    prenom = Column(String(100))
    fonction = Column(String(100))

    # --------------------
    # PERSONAL INFO
    # --------------------
    date_naissance = Column(Date)
    adresse = Column(String(255))
    telephone = Column(String(50))
    email = Column(String(100))
    nin = Column(String(50))
    assurance = Column(String(50))

    date_entree = Column(Date)
    date_recrutement = Column(Date)   

    sit_fam = Column(String(50))
    nombre_enfants = Column(Integer)

    groupage = Column(String(10))
    compte_banque = Column(String(100))

    categorie = Column(String(50))
    affectation = Column(String(100))
    diplome = Column(String(100))

    type_contrat = Column(String(50))
    debut_contrat = Column(Date)
    fin_contrat = Column(Date)

    date_sortie = Column(Date)
    motif_sortie = Column(String(255))
    mesure_disciplinaire = Column(String(255))
    derniere_visite_medicale = Column(Date)

    # --------------------
    # HIERARCHY
    # --------------------
    manager_id = Column(Integer, nullable=True)

    # --------------------
    # ROLE
    # --------------------
    role = Column(
        Enum("employee", "directeur", "hr", "admin", name="employee_roles"),
        default="employee",
        nullable=False
    )