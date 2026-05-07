from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.attestation import AttestationCreate
from app.models.attestation_travail import AttestationTravail
from app.auth.deps import get_current_user, require_role
from app.models.auth_user import AuthUser
ats_router = APIRouter()
@ats_router.post("/attestation")
def create_attestation(
    data: AttestationCreate,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("employee"))
):
    doc = AttestationTravail(
        **data.dict(),
        user_id=current_user.employee_id  
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)

    return doc
#get all ats
@ats_router.get("/attestation")
def get_all(
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin", "hr"))
):
    return db.query(AttestationTravail).all()
#get ats by user id 
@ats_router.get("/attestation/user/{user_id}")
def get_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    if current_user.employee.role not in ["admin", "hr"] and current_user.employee_id != user_id:
        raise HTTPException(403, "Not allowed")

    return db.query(AttestationTravail)\
        .filter(AttestationTravail.user_id == user_id)\
        .all()
@ats_router.get("/attestation/{id}")
def get_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    doc = db.query(AttestationTravail).filter_by(id=id).first()

    if not doc:
        raise HTTPException(404, "Not found")

    if current_user.employee.role not in ["admin", "hr"] and current_user.employee_id != doc.user_id:
        raise HTTPException(403, "Not allowed")
    return doc
@ats_router.delete("/attestation/{id}")
def delete(
    id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin"))
):
    doc = db.query(AttestationTravail).filter_by(id=id).first()

    if not doc:
        raise HTTPException(404, "Not found")

    db.delete(doc)
    db.commit()

    return {"message": "Deleted"}
