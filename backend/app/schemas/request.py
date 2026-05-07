from pydantic import BaseModel
from typing import Optional, Literal, Dict, Any
from datetime import date, time


# ── Sub-schemas matching exact DB columns ──────────────────────────────────────
class PlacementData(BaseModel):
    host_structure: Optional[str] = None
    duration:       Optional[str] = None
    conditions:     Optional[str] = None
# app/schemas/request.py
class CongeData(BaseModel):
    type_conge: Literal["annuel", "recuperation", "sans_solde", "autre"]
    date_debut: date
    date_fin: date
    nb_jours: int
    interim: Optional[str] = None
    adresse: Optional[str] = None
    motif: Optional[str] = None  # Reason for exceptional leave
    document_path: Optional[str] = None # Medical cert path

class MissionData(BaseModel):
    destination: Optional[str] = None
    objet: Optional[str] = None
    itineraire: Optional[str] = None
    duree: Optional[int] = None
    date_depart: Optional[date] = None
    date_retour: Optional[date] = None
    transport: Optional[str] = None

class SortieData(BaseModel):
    date_sortie: Optional[date] = None
    heure_sortie: Optional[time] = None
    heure_retour: Optional[time] = None
    motif: Optional[str] = None

class FormationData(BaseModel):
    theme: Optional[str] = None
    type_formation: Optional[Literal["courte", "moyenne", "longue"]] = None
    periode: Optional[str] = None
    objectifs: Optional[str] = None


# ── Request schemas ────────────────────────────────────────────────────────────

class RequestCreate(BaseModel):
    type: Literal["conge", "mission", "sortie", "formation", "placement"]
    conge:     Optional[CongeData]     = None
    mission:   Optional[MissionData]   = None
    sortie:    Optional[SortieData]    = None
    formation: Optional[FormationData] = None
    placement: Optional[PlacementData] = None

class RequestUpdate(BaseModel):
    status:    Optional[Literal["pending", "approved", "rejected"]] = None
    responsible_comments: Optional[str] = None  # Comments from manager/HR
    conge:     Optional[CongeData]     = None
    mission:   Optional[MissionData]   = None
    sortie:    Optional[SortieData]    = None
    formation: Optional[FormationData] = None
    placement: Optional[PlacementData] = None