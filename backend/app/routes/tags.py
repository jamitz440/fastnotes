from app.auth import require_auth
from app.database import get_session
from app.models import Note, NoteCreate, NoteTag, NoteUpdate, Tag, TagCreate, User
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

router = APIRouter(prefix="/tags", tags=["tags"])

@router.get("/")
def list_tags(session: Session = Depends(get_session)):
    tags = session.exec(select(Tag)).all()
    return tags

@router.post('/', response_model=Tag)
def create_tag(
    tag: TagCreate,
    current_user: User = Depends(require_auth),
    session: Session = Depends(get_session)
):
    tag_data = tag.model_dump()
    tag_data["user_id"] = current_user.id
    db_tag = Tag.model_validate(tag_data)

    session.add(db_tag)
    session.commit()
    session.refresh(db_tag)
    return db_tag


@router.post("/note/{note_id}/tag/{tag_id}")
def add_tag_to_note(
    note_id: int,
    tag_id: int,
    current_user: User = Depends(require_auth),
    session: Session = Depends(get_session)
):
    existing = session.exec(
        select(NoteTag)
        .where(NoteTag.note_id == note_id)
        .where(NoteTag.tag_id == tag_id)
    ).first()

    if existing:
        return {"message": "Tag already added"}

    note_tag = NoteTag(note_id=note_id, tag_id=tag_id)
    session.add(note_tag)
    session.commit()

    return note_tag

@router.delete("/{tag_id}")
def delete_note(tag_id: int, session: Session = Depends(get_session)):
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    session.delete(tag)
    session.commit()
    return {"message": "tag deleted"}
