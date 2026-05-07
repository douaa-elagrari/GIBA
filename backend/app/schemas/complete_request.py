from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime, time
from typing import Literal


# -------------------------
# CONGE REQUEST SCHEMAS
# -------------------------
class CongeRequestSchema(BaseModel):
    type_conge: Optional[Literal["annuel", "recuperation", "sans_solde", "autre"]] = None
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None
    nb_jours: Optional[int] = None
    interim: Optional[str] = None
    adresse: Optional[str] = None

    class Config:
        from_attributes = True


# -------------------------
# MISSION REQUEST SCHEMAS
# -------------------------
class MissionRequestSchema(BaseModel):
    destination: Optional[str] = None
    objet: Optional[str] = None
    itineraire: Optional[str] = None
    duree: Optional[int] = None
    date_depart: Optional[date] = None
    date_retour: Optional[date] = None
    transport: Optional[str] = None

    class Config:
        from_attributes = True


# -------------------------
# SORTIE REQUEST SCHEMAS
# -------------------------
class SortieRequestSchema(BaseModel):
    date_sortie: Optional[date] = None
    heure_sortie: Optional[time] = None
    heure_retour: Optional[time] = None
    motif: Optional[str] = None

    class Config:
        from_attributes = True


# -------------------------
# FORMATION REQUEST SCHEMAS
# -------------------------
class FormationRequestSchema(BaseModel):
    theme: Optional[str] = None
    type_formation: Optional[Literal["courte", "moyenne", "longue"]] = None
    periode: Optional[str] = None
    objectifs: Optional[str] = None

    class Config:
        from_attributes = True


# -------------------------
# TITRE CONGE SCHEMAS
# -------------------------
class TitreCongeSchema(BaseModel):
    conge_request_id: int
    exercice: int
    duree: int
    date_reprise: date
    reliquat: int

    class Config:
        from_attributes = True


# -------------------------
# ORDRE MISSION SCHEMAS
# -------------------------
class OrdreMissionSchema(BaseModel):
    mission_request_id: int
    reference: str
    date_emission: date

    class Config:
        from_attributes = True


# -------------------------
# REQUEST SCHEMAS (Complete)
# -------------------------
class RequestCreateComplete(BaseModel):
    type: Literal["sortie", "conge", "mission", "formation"]
    conge: Optional[CongeRequestSchema] = None
    mission: Optional[MissionRequestSchema] = None
    sortie: Optional[SortieRequestSchema] = None
    formation: Optional[FormationRequestSchema] = None

    class Config:
        from_attributes = True


class RequestUpdateComplete(BaseModel):
    status: Optional[Literal["pending", "approved", "rejected"]] = None
    conge: Optional[CongeRequestSchema] = None
    mission: Optional[MissionRequestSchema] = None
    sortie: Optional[SortieRequestSchema] = None
    formation: Optional[FormationRequestSchema] = None

    class Config:
        from_attributes = True


class RequestResponseComplete(BaseModel):
    id: int
    userId: int
    type: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None

    class Config:
        from_attributes = True
