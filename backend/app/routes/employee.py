from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from app.auth.deps import get_current_user, require_role
from app.models.auth_user import AuthUser

employee_router = APIRouter()


# --------------------
# CREATE EMPLOYEE
# --------------------
@employee_router.post("/employees")
def create_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin", "hr", "directeur"))
):
    emp = Employee(**data.dict())

    db.add(emp)
    db.commit()
    db.refresh(emp)

    return emp


# --------------------
# GET ALL EMPLOYEES
# --------------------
@employee_router.get("/employees")
def get_employees(
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin", "hr","directeur"))
):
    return db.query(Employee).all()


# --------------------
# GET ONE EMPLOYEE
# --------------------
@employee_router.get("/employees/{id}")
def get_employee(
    id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    emp = db.query(Employee).filter(Employee.id == id).first()

    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # allow admin/hr OR the same employee
    if current_user.employee.role not in ["admin", "hr"] and current_user.employee_id != id:
        raise HTTPException(status_code=403, detail="Not allowed")

    return emp


# --------------------
# UPDATE EMPLOYEE
# --------------------
# --------------------
# UPDATE EMPLOYEE
# --------------------
@employee_router.put("/employees/{id}")
def update_employee(
    id: int,
    data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)  # ← was require_role("admin")
):
    emp = db.query(Employee).filter(Employee.id == id).first()

    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Allow admin OR the employee updating themselves
    is_admin = current_user.employee.role in ["admin", "directeur", "hr"]
    is_self = current_user.employee_id == id

    if not is_admin and not is_self:
        raise HTTPException(status_code=403, detail="Not allowed")

    # If a regular employee, restrict which fields they can change
    if not is_admin:
        allowed_fields = {"telephone", "email"}
        update_data = {
            k: v for k, v in data.dict(exclude_unset=True).items()
            if k in allowed_fields
        }
    else:
        update_data = data.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(emp, key, value)

    db.commit()
    db.refresh(emp)

    return emp
# --------------------
# DELETE EMPLOYEE
# --------------------
@employee_router.delete("/employees/{id}")
def delete_employee(
    id: int,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("admin","hr","directeur"))
):
    emp = db.query(Employee).filter(Employee.id == id).first()

    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(emp)
    db.commit()

    return {"message": "Employee deleted successfully"}