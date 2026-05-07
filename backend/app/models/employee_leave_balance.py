from sqlalchemy import Column, Integer, ForeignKey
from app.database import Base


class EmployeeLeaveBalance(Base):
    __tablename__ = "employee_leave_balance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employee.id"))
    exercice_id = Column(Integer, ForeignKey("exercice.id"))
    initial_days = Column(Integer, default=0)
    used_days = Column(Integer, default=0)
