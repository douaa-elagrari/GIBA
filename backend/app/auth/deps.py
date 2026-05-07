from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.auth_user import AuthUser
from app.models.employee import Employee
from app.auth.jwt import verify_token

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    payload = verify_token(token)

    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(AuthUser).filter(AuthUser.id == payload["user_id"]).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # GET EMPLOYEE
    employee = db.query(Employee).filter(Employee.id == user.employee_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # ATTACH EMPLOYEE DATA TO USER
    user.employee = employee  

    return user
def require_role(*roles):
    def checker(current_user: AuthUser = Depends(get_current_user)):

        if current_user.employee.role not in roles:
            raise HTTPException(status_code=403, detail="Not allowed")

        return current_user

    return checker