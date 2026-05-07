from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.mission import OrdreMissionCreate, OrdreMissionUpdate
from app.models.ordre_mission import OrdreMission
from app.models.mission_request import MissionRequest
from app.models.request import Request
from app.auth.deps import get_current_user, require_role
from app.models.auth_user import AuthUser
mission_router = APIRouter()
#get all missions
@mission_router.get("/mission")
def get_all_missions(
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin", "hr"))
):
    return db.query(OrdreMission).all()
#get mission by id 
@mission_router.get("/mission/{id}")
def get_ordre_mission(
    id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    doc = db.query(OrdreMission).filter_by(id=id).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    mission_req = db.query(MissionRequest).filter_by(request_id=doc.mission_request_id).first()
    req = db.query(Request).filter_by(id=mission_req.request_id).first()
    # access control
    if current_user.employee.role not in ["admin", "hr"] and current_user.employee_id != req.userId:
        raise HTTPException(403, "Not allowed")

    return doc
#get ordre de mission it by request
@mission_router.get("/mission/request/{request_id}")
def get_mission_by_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):

    doc = db.query(OrdreMission).filter_by(mission_request_id=request_id).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Not found")

    # optional safety check
    if current_user.role not in ["admin", "hr"] and current_user.employee_id != doc.mission_request.request.userId:
        raise HTTPException(status_code=403, detail="Not allowed")

    return doc
#delete ordre de mission by id
@mission_router.delete("/mission/{id}")
def delete_ordre_mission(
    id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin"))
):
    doc = db.query(OrdreMission).filter_by(id=id).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(doc)
    db.commit()

    return {"message": "Deleted"}
#get mission documents by user id 
@mission_router.get("/mission/user/{user_id}")
def get_mission_docs(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):

    if current_user.employee.role not in ["admin", "hr"] and current_user.employee_id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    return db.query(OrdreMission)\
        .join(MissionRequest)\
        .join(Request)\
        .filter(Request.userId == user_id)\
        .all()