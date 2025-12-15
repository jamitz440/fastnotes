import secrets
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.models import Session as SessionModel
from app.models import User


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_session(
    user_id: int, request: Request, db: Session, expires_in_days: int = 30
) -> str:
    session_id = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=expires_in_days)

    db_session = SessionModel(
        session_id=session_id,
        user_id=user_id,
        expires_at=expires_at,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(db_session)
    db.commit()

    return session_id


def get_session_user(session_id: Optional[str], db: Session) -> Optional[User]:
    if not session_id:
        return None

    session = db.exec(
        select(SessionModel).where(SessionModel.session_id == session_id)
    ).first()

    if not session or session.expires_at < datetime.now():
        return None

    return session.user


async def require_auth(
    session_id: Optional[str] = Cookie(None), db: Session = Depends(get_session)
) -> User:
    user = get_session_user(session_id, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    return user
