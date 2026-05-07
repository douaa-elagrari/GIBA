from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)


def _ensure_conge_request_columns():
    inspector = inspect(engine)
    if "conge_request" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("conge_request")}
    with engine.begin() as conn:
        if "motif" not in existing_columns:
            conn.execute(text("ALTER TABLE conge_request ADD COLUMN motif TEXT NULL"))
        if "document_path" not in existing_columns:
            conn.execute(text("ALTER TABLE conge_request ADD COLUMN document_path VARCHAR(255) NULL"))


def _ensure_request_columns():
    """Ensure request table has responsible_comments column"""
    inspector = inspect(engine)
    if "request" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("request")}
    with engine.begin() as conn:
        if "responsible_comments" not in existing_columns:
            conn.execute(text("ALTER TABLE request ADD COLUMN responsible_comments TEXT NULL"))


_ensure_conge_request_columns()
_ensure_request_columns()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()