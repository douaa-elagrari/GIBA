from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import get_db
from app.routes.employee import employee_router
from app.routes.request import request_router
from app.routes.titre_conge import conge_router
from app.routes.ordre_misssion import mission_router
from app.routes.documents import doc_router
from app.routes.attestation import ats_router
from app.routes.auth import auth_router
from app.routes.users import router
from fastapi.staticfiles import StaticFiles


app = FastAPI(title="HR Management System API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(employee_router, prefix="/api", tags=["Employees"])
app.include_router(request_router, prefix="/api", tags=["Requests"])
app.include_router(conge_router, prefix="/api", tags=["Leave"])
app.include_router(mission_router, prefix="/api", tags=["Missions"])
app.include_router(doc_router, prefix="/api", tags=["Documents"])
app.include_router(ats_router, prefix="/api", tags=["Attestations"])
app.include_router(router, prefix="/api/users", tags=["Users"])


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Server is running"}