import os

from sqlmodel import Session, SQLModel, create_engine  # type: ignore

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./notes.db")

# Only use check_same_thread for SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=True, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
