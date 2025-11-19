# backend/app/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .models import add_note, get_all_notes

app = FastAPI(title="Simple Note API")


class NoteIn(BaseModel):
    title: str
    body: str


class NoteOut(NoteIn):
    id: int


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/notes", response_model=list[NoteOut])
def list_notes():
    return get_all_notes()


@app.post("/notes", response_model=NoteOut, status_code=201)
def create_note(note: NoteIn):
    # Very tiny validation – you can expand later
    if not note.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    return add_note(note.title, note.body)
