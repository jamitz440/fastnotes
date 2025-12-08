from datetime import datetime
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel  # type: ignore


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    salt: str
    wrapped_master_key: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Add relationships to existing models
    notes: List["Note"] = Relationship(back_populates="user")
    folders: List["Folder"] = Relationship(back_populates="user")
    sessions: List["Session"] = Relationship(back_populates="user")


class Session(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(unique=True, index=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    user: User = Relationship(back_populates="sessions")


class Folder(SQLModel, table=True):  # type: ignore
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    parent_id: Optional[int] = Field(default=None, foreign_key="folder.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: int = Field(foreign_key="user.id")

    # Relationships
    parent: Optional["Folder"] = Relationship(
        back_populates="children", sa_relationship_kwargs={"remote_side": "Folder.id"}
    )
    children: List["Folder"] = Relationship(back_populates="parent")
    notes: List["Note"] = Relationship(back_populates="folder")
    user: User = Relationship(back_populates="folders")


class Note(SQLModel, table=True):  # type: ignore
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=255)
    content: str
    folder_id: Optional[int] = Field(default=None, foreign_key="folder.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: int = Field(foreign_key="user.id")

    folder: Optional[Folder] = Relationship(back_populates="notes")
    user: User = Relationship(back_populates="notes")


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


class FolderUpdate(SQLModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None
