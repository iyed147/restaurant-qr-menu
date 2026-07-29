from datetime import datetime, timezone, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt

from app.db.session import get_db
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.client_session import ClientSession

security_scheme = HTTPBearer()

CLIENT_SESSION_MAX_AGE = timedelta(hours=3)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    cred_exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise cred_exc
    except Exception:
        raise cred_exc

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise cred_exc
    return user


def require_roles(*allowed: UserRole):
    def checker(user: User = Depends(get_current_user)):
        if user.role not in allowed:
            raise HTTPException(status_code=403, detail="Permissions insuffisantes")
        return user
    return checker


def ensure_client_session_valid(client_session: ClientSession) -> None:
    """Lève une 401 'session_expired' si la session client dépasse 3h."""
    now = datetime.now(timezone.utc)
    created = client_session.created_at
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    if now - created > CLIENT_SESSION_MAX_AGE:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="session_expired")