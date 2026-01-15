import os

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine  # type: ignore

load_dotenv()
# Get database URL from environment, with proper fallback
DATABASE_URL = os.getenv("DATABASE_URL")

# If DATABASE_URL is not set or empty, use default SQLite
if not DATABASE_URL or DATABASE_URL.strip() == "":
    DATABASE_URL = "sqlite:////app/data/notes.db"
    print(f"WARNING: DATABASE_URL not set, using default: {DATABASE_URL}")
else:
    print(f"Using DATABASE_URL: {DATABASE_URL}")

# Only use check_same_thread for SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=True, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
