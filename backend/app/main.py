from fastapi import FastAPI  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type:ignore

from app.database import create_db_and_tables
from app.routes import folders, notes

app = FastAPI(title="Notes API")

# CORS - adjust origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


app.include_router(notes.router, prefix="/api")
app.include_router(folders.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Notes API"}
