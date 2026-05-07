from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import random

from app.database import get_db
from app.models.auth_user import AuthUser
from app.schemas.auth import SignupSchema, LoginSchema, VerifySchema
from app.auth.auth import hash_password, verify_password, create_token
from app.auth.deps import get_current_user

auth_router = APIRouter()


class ChangePasswordSchema(BaseModel):
    current_password: str
    new_password: str

class UpdateEmailSchema(BaseModel):
    new_email: str

@auth_router.put("/update-email")
def update_email(
    data: UpdateEmailSchema,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    existing = db.query(AuthUser).filter(
        AuthUser.email == data.new_email,
        AuthUser.id != current_user.id
    ).first()
    if existing:
        raise HTTPException(400, "Email already in use")

    current_user.email = data.new_email

    if current_user.employee:
        current_user.employee.email = data.new_email

    db.commit()
    return {"message": "Email updated"}
@auth_router.post("/signup")
def signup(data: SignupSchema, db: Session = Depends(get_db)):
    existing = db.query(AuthUser).filter(AuthUser.email == data.email).first()
    if existing:
        raise HTTPException(400, "Email already exists")

    code = str(random.randint(100000, 999999))

    user = AuthUser(
        employee_id=data.employee_id,
        email=data.email,
        hashed_password=hash_password(data.password),
        verification_code=code
    )

    db.add(user)
    db.commit()
    print("Verification code:", code)
    return {"message": "Account created, verify email"}


@auth_router.post("/verify")
def verify(data: VerifySchema, db: Session = Depends(get_db)):
    user = db.query(AuthUser).filter(AuthUser.email == data.email).first()

    if not user or user.verification_code != data.code:
        raise HTTPException(400, "Invalid code")

    user.is_verified = True
    user.verification_code = None
    db.commit()
    return {"message": "Verified"}


@auth_router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(AuthUser).filter(AuthUser.email == data.email).first()

    if not user:
        raise HTTPException(404, "User not found")

    if not user.is_verified:
        raise HTTPException(403, "Not verified")

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Wrong password")

    token = create_token({
        "user_id": user.id,
        "employee_id": user.employee_id
    })

    return {"access_token": token, "token_type": "bearer"}


@auth_router.post("/change-password")
def change_password(
    data: ChangePasswordSchema,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(400, "Current password is incorrect")

    if len(data.new_password) < 6:
        raise HTTPException(400, "New password must be at least 6 characters")

    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}