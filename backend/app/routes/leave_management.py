from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.exercice import Exercice
from app.models.employee_leave_balance import EmployeeLeaveBalance
from app.schemas.leave_management import (
    ExerciceSchema,
    ExerciceResponseSchema,
    EmployeeLeaveBalanceSchema,
    EmployeeLeaveBalanceResponseSchema
)
from app.auth.deps import get_current_user, require_role
from app.models.auth_user import AuthUser

leave_router = APIRouter()


# ========================
# EXERCICE MANAGEMENT
# ========================

@leave_router.post("/exercices", response_model=ExerciceResponseSchema)
def create_exercice(
    data: ExerciceSchema,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin"))
):
    """Create a new exercice (fiscal year)"""
    exercice = Exercice(**data.dict())
    db.add(exercice)
    db.commit()
    db.refresh(exercice)
    return exercice


@leave_router.get("/exercices")
def get_all_exercices(
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    """Get all exercices"""
    return db.query(Exercice).all()


@leave_router.get("/exercices/{exercice_id}", response_model=ExerciceResponseSchema)
def get_exercice(
    exercice_id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    """Get exercice by ID"""
    exercice = db.query(Exercice).filter(Exercice.id == exercice_id).first()
    if not exercice:
        raise HTTPException(status_code=404, detail="Exercice not found")
    return exercice


@leave_router.put("/exercices/{exercice_id}", response_model=ExerciceResponseSchema)
def update_exercice(
    exercice_id: int,
    data: ExerciceSchema,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin"))
):
    """Update exercice"""
    exercice = db.query(Exercice).filter(Exercice.id == exercice_id).first()
    if not exercice:
        raise HTTPException(status_code=404, detail="Exercice not found")
    
    for key, value in data.dict().items():
        setattr(exercice, key, value)
    
    db.commit()
    db.refresh(exercice)
    return exercice


@leave_router.delete("/exercices/{exercice_id}")
def delete_exercice(
    exercice_id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin"))
):
    """Delete exercice"""
    exercice = db.query(Exercice).filter(Exercice.id == exercice_id).first()
    if not exercice:
        raise HTTPException(status_code=404, detail="Exercice not found")
    
    db.delete(exercice)
    db.commit()
    return {"message": "Exercice deleted successfully"}


# ========================
# LEAVE BALANCE MANAGEMENT
# ========================

@leave_router.post("/leave-balance", response_model=EmployeeLeaveBalanceResponseSchema)
def create_leave_balance(
    data: EmployeeLeaveBalanceSchema,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin", "hr"))
):
    """Create leave balance for employee"""
    balance = EmployeeLeaveBalance(**data.dict())
    db.add(balance)
    db.commit()
    db.refresh(balance)
    return balance


@leave_router.get("/leave-balance")
def get_all_leave_balances(
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin", "hr"))
):
    """Get all leave balances"""
    return db.query(EmployeeLeaveBalance).all()


@leave_router.get("/leave-balance/employee/{employee_id}")
def get_employee_leave_balances(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    """Get leave balances for specific employee"""
    if current_user.employee.role not in ["admin", "hr"] and current_user.employee_id != employee_id:
        raise HTTPException(status_code=403, detail="Not allowed")
    
    return db.query(EmployeeLeaveBalance).filter(
        EmployeeLeaveBalance.employee_id == employee_id
    ).all()


@leave_router.get("/leave-balance/{balance_id}", response_model=EmployeeLeaveBalanceResponseSchema)
def get_leave_balance(
    balance_id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    """Get leave balance by ID"""
    balance = db.query(EmployeeLeaveBalance).filter(
        EmployeeLeaveBalance.id == balance_id
    ).first()
    if not balance:
        raise HTTPException(status_code=404, detail="Leave balance not found")
    
    if current_user.employee.role not in ["admin", "hr"] and current_user.employee_id != balance.employee_id:
        raise HTTPException(status_code=403, detail="Not allowed")
    
    return balance


@leave_router.put("/leave-balance/{balance_id}", response_model=EmployeeLeaveBalanceResponseSchema)
def update_leave_balance(
    balance_id: int,
    data: EmployeeLeaveBalanceSchema,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin", "hr"))
):
    """Update leave balance"""
    balance = db.query(EmployeeLeaveBalance).filter(
        EmployeeLeaveBalance.id == balance_id
    ).first()
    if not balance:
        raise HTTPException(status_code=404, detail="Leave balance not found")
    
    for key, value in data.dict().items():
        setattr(balance, key, value)
    
    db.commit()
    db.refresh(balance)
    return balance


@leave_router.delete("/leave-balance/{balance_id}")
def delete_leave_balance(
    balance_id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin", "hr"))
):
    """Delete leave balance"""
    balance = db.query(EmployeeLeaveBalance).filter(
        EmployeeLeaveBalance.id == balance_id
    ).first()
    if not balance:
        raise HTTPException(status_code=404, detail="Leave balance not found")
    
    db.delete(balance)
    db.commit()
    return {"message": "Leave balance deleted successfully"}
