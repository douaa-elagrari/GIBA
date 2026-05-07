from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
from typing import Literal


# ----------------------
# CREATE EMPLOYEE
# ----------------------
class EmployeeCreate(BaseModel):
    matricule: str
    nom: str
    prenom: str
    fonction: str
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    date_naissance: Optional[date] = None
    adresse: Optional[str] = None
    nin: Optional[str] = None
    date_recrutement: Optional[date] = None
    assurance: Optional[str] = None
    date_entree: Optional[date] = None
    sit_fam: Optional[str] = None
    nombre_enfants: Optional[int] = None
    groupage: Optional[str] = None
    compte_banque: Optional[str] = None
    categorie: Optional[str] = None
    affectation: Optional[str] = None
    diplome: Optional[str] = None
    type_contrat: Optional[str] = None
    debut_contrat: Optional[date] = None
    fin_contrat: Optional[date] = None
    role: Optional[Literal["employee", "directeur", "hr", "admin"]] = "employee"
    manager_id: Optional[int] = None


# ----------------------
# UPDATE EMPLOYEE
# ----------------------
class EmployeeUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    fonction: Optional[str] = None
    email: Optional[EmailStr] = None
    date_recrutement: Optional[date] = None
    telephone: Optional[str] = None
    date_naissance: Optional[date] = None
    adresse: Optional[str] = None
    nin: Optional[str] = None
    assurance: Optional[str] = None
    date_entree: Optional[date] = None
    sit_fam: Optional[str] = None
    nombre_enfants: Optional[int] = None
    groupage: Optional[str] = None
    compte_banque: Optional[str] = None
    categorie: Optional[str] = None
    affectation: Optional[str] = None
    diplome: Optional[str] = None
    type_contrat: Optional[str] = None
    debut_contrat: Optional[date] = None
    fin_contrat: Optional[date] = None
    role: Optional[Literal["employee", "directeur", "hr", "admin"]] = None
    manager_id: Optional[int] = None
    date_sortie: Optional[date] = None
    motif_sortie: Optional[str] = None
    mesure_disciplinaire: Optional[str] = None
    derniere_visite_medicale: Optional[date] = None


# ----------------------
# RESPONSE
# ----------------------
class EmployeeResponse(BaseModel):
    id: int
    matricule: str
    nom: str
    prenom: str
    fonction: str
    email: Optional[str]
    telephone: Optional[str]
    date_naissance: Optional[date]
    date_recrutement: Optional[date] = None
    adresse: Optional[str]
    role: str
    manager_id: Optional[int]

    class Config:
        from_attributes = True


class EmployeeDetailedResponse(BaseModel):
    id: int
    matricule: str
    nom: str
    prenom: str
    fonction: str
    email: Optional[str]
    telephone: Optional[str]
    date_recrutement: Optional[date] = None
    date_naissance: Optional[date]
    adresse: Optional[str]
    nin: Optional[str]
    assurance: Optional[str]
    date_entree: Optional[date]
    sit_fam: Optional[str]
    nombre_enfants: Optional[int]
    groupage: Optional[str]
    compte_banque: Optional[str]
    categorie: Optional[str]
    affectation: Optional[str]
    diplome: Optional[str]
    type_contrat: Optional[str]
    debut_contrat: Optional[date]
    fin_contrat: Optional[date]
    date_sortie: Optional[date]
    motif_sortie: Optional[str]
    mesure_disciplinaire: Optional[str]
    derniere_visite_medicale: Optional[date]
    role: str
    manager_id: Optional[int]

    class Config:
        from_attributes = True