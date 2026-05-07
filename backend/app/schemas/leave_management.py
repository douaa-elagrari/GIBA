from pydantic import BaseModel
from typing import Optional
from datetime import date


class ExerciceSchema(BaseModel):
    label: str
    date_debut: date
    date_fin: date

    class Config:
        from_attributes = True


class ExerciceResponseSchema(BaseModel):
    id: int
    label: str
    date_debut: date
    date_fin: date

    class Config:
        from_attributes = True


class CongeAllocationSchema(BaseModel):
    conge_request_id: int
    exercice_id: int
    days_allocated: int

    class Config:
        from_attributes = True


class EmployeeLeaveBalanceSchema(BaseModel):
    employee_id: int
    exercice_id: int
    initial_days: int = 0
    used_days: int = 0

    class Config:
        from_attributes = True


class EmployeeLeaveBalanceResponseSchema(BaseModel):
    id: int
    employee_id: int
    exercice_id: int
    initial_days: int
    used_days: int

    class Config:
        from_attributes = True
