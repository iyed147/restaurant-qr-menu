from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt

from app.db.session import get_db
from app.core.config import settings
from app.models.user import User, UserRole

security_scheme = HTTPBearer()


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