import os

from fastapi import FastAPI  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type:ignore

from app.database import create_db_and_tables
from app.routes import auth, folders, notes, tags

app = FastAPI(title="Notes API")

# CORS - configure via environment variable
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:80").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


app.include_router(notes.router, prefix="/api")
app.include_router(folders.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(tags.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Notes API"}


@app.get("/health")
def health():
    """Health check endpoint for Docker and Coolify"""
    return {"status": "healthy"}
