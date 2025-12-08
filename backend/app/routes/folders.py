from typing import List

from fastapi import APIRouter, Depends, HTTPException  # type: ignore
from sqlmodel import Session, select  # type: ignore

from app.auth import require_auth
from app.database import get_session
from app.models import (
    Folder,
    FolderCreate,
    FolderTreeNode,
    FolderTreeResponse,
    FolderUpdate,
    Note,
    NoteRead,
    User,
)

router = APIRouter(prefix="/folders", tags=["folders"])


def build_folder_tree_node(folder: Folder) -> FolderTreeNode:
    """Recursively build a folder tree node with notes and children"""
    return FolderTreeNode(
        id=folder.id,  # pyright: ignore[reportArgumentType]
        name=folder.name,
        notes=[NoteRead.model_validate(note) for note in folder.notes],
        children=[build_folder_tree_node(child) for child in folder.children],
    )


@router.get("/tree", response_model=FolderTreeResponse)
def get_folder_tree(
    current_user: User = Depends(require_auth), session: Session = Depends(get_session)
):
    """Get complete folder tree with notes"""

    # Get all top-level folders (parent_id is None) for current user
    top_level_folders = session.exec(
        select(Folder)
        .where(Folder.parent_id == None)
        .where(Folder.user_id == current_user.id)
    ).all()

    # Get all orphaned notes (folder_id is None) for current user
    orphaned_notes = session.exec(
        select(Note)
        .where(Note.folder_id == None)
        .where(Note.user_id == current_user.id)
    ).all()

    # Build tree recursively
    tree = [build_folder_tree_node(folder) for folder in top_level_folders]

    return FolderTreeResponse(
        folders=tree,
        orphaned_notes=[NoteRead.model_validate(note) for note in orphaned_notes],
    )


@router.get("/", response_model=List[Folder])
def list_folders(session: Session = Depends(get_session)):
    """Get flat list of all folders"""
    folders = session.exec(select(Folder)).all()
    return folders


@router.post("/", response_model=Folder)
def create_folder(
    folder: FolderCreate,
    current_user: User = Depends(require_auth),
    session: Session = Depends(get_session),
):
    """Create a new folder"""
    folder_data = folder.model_dump()
    folder_data["user_id"] = current_user.id
    db_folder = Folder.model_validate(folder_data)
    session.add(db_folder)
    session.commit()
    session.refresh(db_folder)
    return db_folder


@router.delete("/{folder_id}")
def delete_folder(folder_id: int, session: Session = Depends(get_session)):
    """Delete a folder"""
    folder = session.get(Folder, folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    session.delete(folder)
    session.commit()
    return {"message": "Folder deleted"}


@router.patch("/{folder_id}")
def update_folder(
    folder_id: int, folder_update: FolderUpdate, session: Session = Depends(get_session)
):
    """Update a folder"""
    folder = session.get(Folder, folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    update_data = folder_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(folder, key, value)

    session.add(folder)
    session.commit()

    session.refresh(folder)

    return folder
