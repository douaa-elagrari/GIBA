from pydantic import BaseModel
from typing import Optional


# -----------------------
# CREATE / UPDATE MISSION DOC
# -----------------------
class OrdreMissionCreate(BaseModel):
    mission_request_id: int
    reference: str
    date_emission: str


class OrdreMissionUpdate(BaseModel):
    reference: Optional[str] = None
    date_emission: Optional[str] = None


# -----------------------
# RESPONSE
# -----------------------
class OrdreMissionResponse(BaseModel):
    id: int
    mission_request_id: int
    reference: str
    date_emission: str

    class Config:
        from_attributes = True