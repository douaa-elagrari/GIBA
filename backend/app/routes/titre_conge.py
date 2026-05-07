from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.titre_conge import TitreConge
from app.models.conge_request import CongeRequest
from app.models.request import Request

from app.auth.deps import get_current_user, require_role
from app.models.auth_user import AuthUser

conge_router = APIRouter()
#get all documets 
@conge_router.get("/conge")
def get_all_conges(
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin", "hr"))
):
    return db.query(TitreConge).all()
#get documents of conge by id 
@conge_router.get("/conge/{id}")
def get_titre_conge(
    id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    doc = db.query(TitreConge).filter(TitreConge.id == id).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Not found")

    # get request owner
    req = db.query(CongeRequest).filter_by(request_id=doc.conge_request_id).first()
    main_req = db.query(Request).filter_by(id=req.request_id).first()

    if current_user.employee.role not in ["admin", "hr"] and current_user.employee_id != main_req.userId:
        raise HTTPException(status_code=403, detail="Not allowed")

    return doc
#get it by request 
@conge_router.get("/conge/request/{request_id}")
def get_by_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    doc = db.query(TitreConge).filter_by(conge_request_id=request_id).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Not found")

    req = db.query(Request).filter_by(id=request_id).first()

    if current_user.employee.role not in ["admin", "hr"] and current_user.employee_id != req.userId:
        raise HTTPException(status_code=403, detail="Not allowed")

    return doc
#delete conge by id
@conge_router.delete("/conge/{id}")
def delete_titre_conge(
    id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin"))
):
    doc = db.query(TitreConge).filter_by(id=id).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(doc)
    db.commit()

    return {"message": "Deleted"}

#get conge documents by user id 
@conge_router.get("/conge/user/{user_id}")
def get_conge_docs(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    if current_user.employee.role not in ["admin", "hr"] and current_user.employee_id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    return db.query(TitreConge)\
        .join(CongeRequest)\
        .join(Request)\
        .filter(Request.userId == user_id)\
        .all()
