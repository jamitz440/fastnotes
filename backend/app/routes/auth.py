from datetime import datetime
from typing import Optional

from app.auth import create_session, hash_password, require_auth, verify_password
from app.database import get_session
from app.models import Session as SessionModel
from app.models import User
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from sqlmodel import Session, SQLModel, select

router = APIRouter(prefix="/auth", tags=["auth"])


# Request/Response models
class RegisterRequest(SQLModel):
    username: str
    email: str
    password: str
    salt: str
    wrappedMasterKey: str


class LoginRequest(SQLModel):
    username: str
    password: str


class UserResponse(SQLModel):
    id: int
    username: str
    email: str
    salt: str
    wrapped_master_key: str


@router.post("/register")
def register(
    data: RegisterRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_session),
):
    # Check existing user
    existing = db.exec(
        select(User).where(
            (User.username == data.username) | (User.email == data.email)
        )
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    # Create user
    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        salt=data.salt,
        wrapped_master_key=data.wrappedMasterKey,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create session
    assert user.id is not None
    session_id = create_session(user.id, request, db)

    # Set cookie
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=30 * 24 * 60 * 60,  # 30 days
    )

    return {"user": UserResponse.model_validate(user)}


@router.post("/login")
def login(
    data: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_session),
):
    # Find user
    user = db.exec(select(User).where(User.username == data.username)).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create session
    assert user.id is not None
    session_id = create_session(user.id, request, db)

    # Set cookie
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=30 * 24 * 60 * 60,
    )

    return {"user": UserResponse.model_validate(user)}


@router.post("/logout")
def logout(
    response: Response,
    session_id: Optional[str] = Cookie(None),
    db: Session = Depends(get_session),
):
    # Delete session from database
    if session_id:
        session = db.exec(
            select(SessionModel).where(SessionModel.session_id == session_id)
        ).first()
        if session:
            db.delete(session)
            db.commit()

    # Clear cookie
    response.delete_cookie("session_id")
    return {"message": "Logged out"}


@router.get("/me")
def get_current_user(current_user: User = Depends(require_auth)):
    return {"user": UserResponse.from_orm(current_user)}


@router.get("/sessions")
def list_sessions(
    current_user: User = Depends(require_auth), db: Session = Depends(get_session)
):
    sessions = db.exec(
        select(SessionModel)
        .where(SessionModel.user_id == current_user.id)
        .where(SessionModel.expires_at > datetime.utcnow())
    ).all()
    return {"sessions": sessions}


@router.delete("/sessions/{session_token}")
def revoke_session(
    session_token: str,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_session),
):
    session = db.exec(
        select(SessionModel)
        .where(SessionModel.session_id == session_token)
        .where(SessionModel.user_id == current_user.id)
    ).first()

    if session:
        db.delete(session)
        db.commit()

    return {"message": "Session revoked"}
