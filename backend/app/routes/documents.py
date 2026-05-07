from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.deps import get_current_user, require_role
from app.models.auth_user import AuthUser
from app.models.conge_request import CongeRequest
from app.models.mission_request import MissionRequest
from app.models.request import Request
from app.models.titre_conge import TitreConge
from app.models.ordre_mission import OrdreMission
from app.models.attestation_travail import AttestationTravail

doc_router = APIRouter()
#get all documents
@doc_router.get("/documents")
def get_all_documents(
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin", "hr"))
):

    return {
        "titre_conge": db.query(TitreConge).all(),
        "ordre_mission": db.query(OrdreMission).all(),
        "attestation_travail": db.query(AttestationTravail).all()
    }
#get all documents by user id 
@doc_router.get("/documents/user/{user_id}")
def get_all_documents_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    if current_user.employee.role not in ["admin", "hr"] and current_user.employee_id != user_id:
        raise HTTPException(403, "Not allowed")

    conges = db.query(TitreConge)\
        .join(CongeRequest, TitreConge.conge_request_id == CongeRequest.request_id)\
        .join(Request, Request.id == CongeRequest.request_id)\
        .filter(Request.userId == user_id)\
        .all()

    missions = db.query(OrdreMission)\
        .join(MissionRequest, OrdreMission.mission_request_id == MissionRequest.request_id)\
        .join(Request, Request.id == MissionRequest.request_id)\
        .filter(Request.userId == user_id)\
        .all()

    ats = db.query(AttestationTravail)\
        .filter(AttestationTravail.user_id == user_id)\
        .all()

    return {
        "titre_conge": conges,
        "ordre_mission": missions,
        "attestation_travail": ats
    }