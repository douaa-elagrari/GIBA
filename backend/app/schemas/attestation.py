from pydantic import BaseModel
from typing import Optional
from datetime import date


# -----------------------
# CREATE ATTESTATION
# user_id comes from current_user in the router, NOT from the request body
# -----------------------
class AttestationCreate(BaseModel):
    date_naissance: date
    adresse: str
    num_secu: str
    date_embauche: date
    poste: str


# -----------------------
# RESPONSE
# -----------------------
class AttestationResponse(BaseModel):
    id: int
    user_id: int
    poste: str

    class Config:
        from_attributes = True
