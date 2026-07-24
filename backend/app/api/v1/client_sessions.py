from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.table import Table
from app.models.client_session import ClientSession
from app.schemas.client_sessions import ClientSessionStartIn, ClientSessionStartOut
router = APIRouter(prefix="/client-sessions", tags=["Client Sessions"])


@router.post("/start", response_model=ClientSessionStartOut, status_code=status.HTTP_201_CREATED)
def start_client_session(payload: ClientSessionStartIn, db: Session = Depends(get_db)):
    table = (
        db.query(Table)
        .filter(
            Table.restaurant_id == payload.restaurant_id,
            Table.table_token == payload.table_token,
            Table.is_active.is_(True),
        )
        .first()
    )

    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table introuvable ou inactive pour ce QR code.",
        )

    session = ClientSession(
        restaurant_id=payload.restaurant_id,
        table_id=table.id,
        nom=payload.nom.strip(),
        prenom=payload.prenom.strip(),
        telephone=payload.telephone.strip() if payload.telephone else None,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return ClientSessionStartOut(
        client_session_id=session.id,
        restaurant_id=session.restaurant_id,
        table_id=session.table_id,
        table_number=table.table_number,
        nom=session.nom,
        prenom=session.prenom,
        telephone=session.telephone,
    )