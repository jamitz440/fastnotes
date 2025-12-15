from datetime import datetime

from app.auth import require_auth
from app.database import get_session
from app.models import Note, NoteCreate, NoteUpdate, User
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("/")
def list_notes(session: Session = Depends(get_session)):
    notes = session.exec(select(Note).order_by(Note.updated_at.desc())).all()  # pyright: ignore[reportAttributeAccessIssue]
    return notes



@router.post("/", response_model=Note)
def create_note(
    note: NoteCreate,
    current_user: User = Depends(require_auth),
    session: Session = Depends(get_session),
):
    note_data = note.model_dump()
    note_data["user_id"] = current_user.id
    db_note = Note.model_validate(note_data)
    session.add(db_note)
    session.commit()
    session.refresh(db_note)
    return db_note


@router.get("/{note_id}", response_model=Note)
def get_note(note_id: int, session: Session = Depends(get_session)):
    note = session.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.patch("/{note_id}", response_model=Note)
def update_note(
    note_id: int, note_update: NoteUpdate, session: Session = Depends(get_session)
):
    note = session.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    update_data = note_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(note, key, value)

    note.updated_at = datetime.utcnow()
    session.add(note)
    session.commit()
    session.refresh(note)
    return note


@router.delete("/{note_id}")
def delete_note(note_id: int, session: Session = Depends(get_session)):
    note = session.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    session.delete(note)
    session.commit()
    return {"message": "Note deleted"}
