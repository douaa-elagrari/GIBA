from pydantic import BaseModel, EmailStr

class SignupSchema(BaseModel):
    employee_id: int
    email: EmailStr
    password: str
    role: str   # employee / manager / director / hr

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class VerifySchema(BaseModel):
    email: EmailStr
    code: str