from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.deps import get_current_user
from app.models.auth_user import AuthUser
from app.models.employee import Employee

router = APIRouter()


@router.get("/profile")
def get_profile(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile"""
    employee = db.query(Employee).filter(Employee.id == current_user.employee_id).first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at,
        "employee": {
            "id": employee.id,
            "matricule": employee.matricule,
            "nom": employee.nom,
            "prenom": employee.prenom,
            "fonction": employee.fonction,
            "email": employee.email,
            "telephone": employee.telephone,
            "role": employee.role,
            "manager_id": employee.manager_id,
            "date_naissance": employee.date_naissance,
            "adresse": employee.adresse,
            "date_entree": employee.date_entree
        }
    }


@router.get("/me")
def get_current_user_info(
    current_user: AuthUser = Depends(get_current_user)
):
    """Get minimal current user info"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "employee_id": current_user.employee_id,
        "is_verified": current_user.is_verified
    }


@router.put("/profile")
def update_profile(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile with employee details"""
    return {
        "message": "User profile",
        "user": current_user
    }