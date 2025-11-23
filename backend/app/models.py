from datetime import datetime
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel  # type: ignore


class Folder(SQLModel, table=True):  # type: ignore
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    parent_id: Optional[int] = Field(default=None, foreign_key="folder.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    parent: Optional["Folder"] = Relationship(
        back_populates="children", sa_relationship_kwargs={"remote_side": "Folder.id"}
    )
    children: List["Folder"] = Relationship(back_populates="parent")
    notes: List["Note"] = Relationship(back_populates="folder")


class Note(SQLModel, table=True):  # type: ignore
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=255)
    content: str
    folder_id: Optional[int] = Field(default=None, foreign_key="folder.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    folder: Optional[Folder] = Relationship(back_populates="notes")


# API Response models (what gets sent to frontend)
class NoteRead(SQLModel):
    id: int
    title: str
    content: str
    folder_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class FolderTreeNode(SQLModel):
    id: int
    name: str
    notes: List[NoteRead] = []
    children: List["FolderTreeNode"] = []


class FolderTreeResponse(SQLModel):
    folders: List[FolderTreeNode]
    orphaned_notes: List[NoteRead]


# Create/Update models
class NoteCreate(SQLModel):
    title: str
    content: str
    folder_id: Optional[int] = None


class NoteUpdate(SQLModel):
    title: Optional[str] = None
    content: Optional[str] = None
    folder_id: Optional[int] = None


class FolderCreate(SQLModel):
    name: str
    parent_id: Optional[int] = None
