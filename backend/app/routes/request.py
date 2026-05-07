from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Request as FastAPIRequest
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime
import os, shutil, uuid
from fastapi.responses import JSONResponse
import json

from app.database import get_db
from app.auth.deps import get_current_user, require_role
from app.models.employee import Employee
# Import Models
from app.models.request import Request
from app.models.auth_user import AuthUser
from app.models.conge_request import CongeRequest
from app.models.mission_request import MissionRequest
from app.models.sortie_request import SortieRequest
from app.models.formation_request import FormationRequest
from app.models.placement_request import PlacementRequest
from app.models.conge_allocation import CongeAllocation
from app.models.employee_leave_balance import EmployeeLeaveBalance
from app.models.exercice import Exercice
from app.models.titre_conge import TitreConge
from app.models.ordre_mission import OrdreMission

# Import Schemas
from app.schemas.request import RequestCreate, RequestUpdate

request_router = APIRouter()

# ── FIFO Allocation Logic ─────────────────────────────────────────────────────

def allocate_conge_fifo(db: Session, employee_id: int, request_id: int, total_days: int):
    # Get active balances ordered by the oldest exercice (FIFO)
    balances = db.query(EmployeeLeaveBalance)\
        .join(Exercice, EmployeeLeaveBalance.exercice_id == Exercice.id)\
        .filter(EmployeeLeaveBalance.employee_id == employee_id)\
        .filter((EmployeeLeaveBalance.initial_days - EmployeeLeaveBalance.used_days) > 0)\
        .order_by(Exercice.date_debut.asc()).all()

    days_to_allocate = total_days
    
    for balance in balances:
        if days_to_allocate <= 0:
            break
            
        remaining_in_exercice = balance.initial_days - balance.used_days
        
        if remaining_in_exercice >= days_to_allocate:
            balance.used_days += days_to_allocate
            db.add(CongeAllocation(
                conge_request_id=request_id,
                exercice_id=balance.exercice_id,
                days_allocated=days_to_allocate
            ))
            days_to_allocate = 0
        else:
            balance.used_days += remaining_in_exercice
            db.add(CongeAllocation(
                conge_request_id=request_id,
                exercice_id=balance.exercice_id,
                days_allocated=remaining_in_exercice
            ))
            days_to_allocate -= remaining_in_exercice

    if days_to_allocate > 0:
 
        # if the user doesn't actually have enough days.
        pass

# ── Helpers ──────────────────────────────────────────────────────────────────

def get_detail(db: Session, req: Request):
    mapping = {
        "conge": CongeRequest,
        "mission": MissionRequest,
        "sortie": SortieRequest,
        "formation": FormationRequest,
        "placement": PlacementRequest
    }
    model = mapping.get(req.type)
    return db.query(model).filter_by(request_id=req.id).first() if model else None

def delete_detail(db: Session, req: Request):
    mapping = {
        "conge": CongeRequest,
        "mission": MissionRequest,
        "sortie": SortieRequest,
        "formation": FormationRequest,
        "placement": PlacementRequest
    }
    model = mapping.get(req.type)
    if model:
        db.query(model).filter_by(request_id=req.id).delete()


def model_to_dict(instance):
    if instance is None:
        return None
    return {column.name: getattr(instance, column.name) for column in instance.__table__.columns}


def serialize_request(req: Request, detail, db: Session, current_user: AuthUser | None = None):
    employee = db.query(Employee).filter(Employee.id == req.userId).first()
    employee_data = None
    can_approve = False

    if employee:
        employee_data = model_to_dict(employee)
        full_name = f"{employee.nom or ''} {employee.prenom or ''}".strip()
        employee_data["full_name"] = full_name

        if current_user:
            can_approve = current_user.employee_id == employee.manager_id

    return {
        "request": model_to_dict(req),
        "details": model_to_dict(detail),
        "employee": employee_data,
        "can_approve": can_approve
    }

# ── Routes ────────────────────────────────────────────────────────────────────


UPLOAD_DIR = "uploads/conge_documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@request_router.post("/requests")
async def create_request(
    raw: FastAPIRequest,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    content_type = raw.headers.get("content-type", "")

    # ── JSON path (no file) ───────────────────────────────────────────────────
    if "application/json" in content_type:
        body = await raw.json()
        data = RequestCreate(**body)
        return _create_request_from_data(data, db, current_user)

    # ── Multipart path (conge with file) ─────────────────────────────────────
    if "multipart/form-data" in content_type:
        form = await raw.form()

        req_type = form.get("type")
        if req_type != "conge":
            raise HTTPException(400, "Multipart only supported for conge requests")

        # Parse conge fields from form (frontend sends as "conge.field_name")
        def f(key):
            return form.get(f"conge.{key}")

        document_path = None
        doc_file: UploadFile | None = form.get("conge.document")
        if doc_file and hasattr(doc_file, "filename") and doc_file.filename:
            ext = os.path.splitext(doc_file.filename)[-1]
            filename = f"{uuid.uuid4()}{ext}"
            dest = os.path.join(UPLOAD_DIR, filename)
            with open(dest, "wb") as out:
                shutil.copyfileobj(doc_file.file, out)
            document_path = dest

        from app.schemas.request import CongeData, RequestCreate as RC
        conge_data = CongeData(
            type_conge=f("type_conge"),
            date_debut=f("date_debut"),
            date_fin=f("date_fin"),
            nb_jours=int(f("nb_jours")),
            interim=f("interim"),
            adresse=f("adresse"),
            motif=f("motif"),
            document_path=document_path,
        )
        data = RC(type="conge", conge=conge_data)
        return _create_request_from_data(data, db, current_user)

    raise HTTPException(415, "Unsupported media type")


def _create_request_from_data(data: RequestCreate, db: Session, current_user: AuthUser):
    """Shared creation logic for both JSON and multipart paths."""
    req = Request(
        userId=current_user.employee_id,
        type=data.type,
        status="pending"
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    detail_data = getattr(data, data.type)
    if not detail_data:
        raise HTTPException(400, f"{data.type} details required")

    model_map = {
        "conge": CongeRequest,
        "mission": MissionRequest,
        "sortie": SortieRequest,
        "formation": FormationRequest,
        "placement": PlacementRequest,
    }

    db.add(model_map[data.type](request_id=req.id, **detail_data.model_dump(exclude_none=True)))
    db.commit()

    return {"message": "Created", "id": req.id, "type": req.type, "status": req.status}

@request_router.put("/requests/{id}")
def update_request(
    id: int,
    data: RequestUpdate,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    """
    Update/approve request. Admin, HR, and Manager can only update requests 
    from their direct subordinates (where employee.manager_id == current_user.employee_id).
    """
    req = db.query(Request).filter(Request.id == id).first()
    if not req:
        raise HTTPException(404, "Request not found")

    # Get the employee who made the request
    employee = db.query(Employee).filter(Employee.id == req.userId).first()
    if not employee:
        raise HTTPException(404, "Employee not found")

    # Authorization: Only the responsible manager can update
    if current_user.employee_id != employee.manager_id:
        raise HTTPException(403, "Only the responsible manager can approve this request")

    old_status = req.status
    if data.status:
        req.status = data.status
        req.updated_at = datetime.utcnow()
        if data.status == "approved":
            req.finished_at = datetime.utcnow()

    # Store responsible comments
    if data.responsible_comments:
        req.responsible_comments = data.responsible_comments

    detail = get_detail(db, req)
    incoming_detail = getattr(data, req.type, None)
    if incoming_detail:
        for key, value in incoming_detail.model_dump(exclude_none=True).items():
            setattr(detail, key, value)

    # ── LOGIC ON APPROVAL ──
    if old_status != "approved" and data.status == "approved":
        if req.type == "conge":
            # Ensure we have the latest detail data
            if detail.type_conge == "annuel":
                allocate_conge_fifo(db, req.userId, id, detail.nb_jours)
            
            # Recalculate Reliquat for the Titre de Conge
            reliquat = db.query(
                func.sum(EmployeeLeaveBalance.initial_days - EmployeeLeaveBalance.used_days)
            ).filter(EmployeeLeaveBalance.employee_id == req.userId).scalar() or 0

            db.add(TitreConge(
                conge_request_id=id,
                exercice=datetime.now().year,
                duree=detail.nb_jours,
                date_reprise=detail.date_fin,
                reliquat=reliquat
            ))

        elif req.type == "mission":
            if not db.query(OrdreMission).filter_by(mission_request_id=id).first():
                db.add(OrdreMission(
                    mission_request_id=id,
                    reference=f"OM-{id}",
                    date_emission=date.today()
                ))

    db.commit()
    db.refresh(req)
    return serialize_request(req, detail, db, current_user)






# ── GET ALL (filtered by responsibility) ──────────────────────────────────────

@request_router.get("/requests")
def get_requests(
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    """
    Get requests filtered by user's role and responsibility:
    - Admin/HR: all requests
    - Manager (directeur): only requests from direct reports
    - Employee: own requests only
    """
    if current_user.employee.role in ["admin", "hr"]:
        # Admin and HR get all requests
        requests = db.query(Request).all()
    elif current_user.employee.role == "directeur":
        # Manager gets requests from their direct reports only
        subordinate_ids = db.query(Employee.id).filter(
            Employee.manager_id == current_user.employee_id
        ).all()
        subordinate_ids = [emp[0] for emp in subordinate_ids]
        requests = db.query(Request).filter(Request.userId.in_(subordinate_ids)).all()
    else:
        # Regular employee gets only own requests
        requests = db.query(Request).filter(Request.userId == current_user.employee_id).all()
    
    return [serialize_request(req, get_detail(db, req), db, current_user) for req in requests]


# ── GET BY USER ────────────────────────────────────────────────────────────────

@request_router.get("/requests/user/{user_id}")
def get_user_requests(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    if current_user.employee.role not in ["admin", "hr"] and current_user.employee_id != user_id:
        raise HTTPException(403, "Not allowed")

    requests = db.query(Request).filter(Request.userId == user_id).all()
    return [serialize_request(req, get_detail(db, req), db, current_user) for req in requests]





# ── GET BY ID (with full details and authorization) ─────────────────────────────

@request_router.get("/requests/{id}")
def get_request_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    """
    Get request details. Authorization based on role and responsibility:
    - Admin: can view any request
    - HR: can view any request
    - Manager: can only view requests from direct reports
    - Employee: can only view own requests
    """
    req = db.query(Request).filter(Request.id == id).first()
    if not req:
        raise HTTPException(404, "Request not found")

    # Get the employee who made the request
    employee = db.query(Employee).filter(Employee.id == req.userId).first()
    
    # Authorization check
    if current_user.employee.role == "admin" or current_user.employee.role == "hr":
        pass  # Admin/HR can view any request
    elif current_user.employee.role == "directeur":
        # Manager can only view requests from their direct reports
        if employee.manager_id != current_user.employee_id:
            raise HTTPException(403, "Can only view requests from your subordinates")
    else:
        # Employee can only view own requests
        if current_user.employee_id != req.userId:
            raise HTTPException(403, "Not allowed")

    return serialize_request(req, get_detail(db, req), db, current_user)


# ── DELETE BY ID ───────────────────────────────────────────────────────────────

@request_router.delete("/requests/{id}")
def delete_request_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin"))
):
    req = db.query(Request).filter(Request.id == id).first()
    if not req:
        raise HTTPException(404, "Request not found")

    delete_detail(db, req)
    db.delete(req)
    db.commit()

    return {"message": "Request deleted successfully"}


# ── DELETE BY USER ─────────────────────────────────────────────────────────────

@request_router.delete("/requests/user/{user_id}")
def delete_requests_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin"))
):
    reqs = db.query(Request).filter(Request.userId == user_id).all()
    if not reqs:
        raise HTTPException(404, "No requests found for this user")

    for req in reqs:
        delete_detail(db, req)
        db.delete(req)

    db.commit()
    return {"message": f"All requests for user {user_id} deleted"}



@request_router.get("/leave-balance/{employee_id}")
def get_employee_balance(employee_id: int, db: Session = Depends(get_db)):
    balances = db.query(EmployeeLeaveBalance, Exercice)\
        .join(Exercice, EmployeeLeaveBalance.exercice_id == Exercice.id)\
        .filter(EmployeeLeaveBalance.employee_id == employee_id)\
        .all()
    
    return [
        {
            "exercice": b.Exercice.label,
            "initial": b.EmployeeLeaveBalance.initial_days,
            "used": b.EmployeeLeaveBalance.used_days,
            "remaining": b.EmployeeLeaveBalance.initial_days - b.EmployeeLeaveBalance.used_days
        } for b in balances
    ]

@request_router.post("/leave-balance/init")
def init_exercice_balance(employee_id: int, exercice_id: int, days: int, db: Session = Depends(get_db)):
    # Used by HR to set the 30 days at the start of a year
    balance = EmployeeLeaveBalance(
        employee_id=employee_id,
        exercice_id=exercice_id,
        initial_days=days
    )
    db.add(balance)
    db.commit()
    return {"message": "Balance initialized"}