from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import require_roles, ensure_client_session_valid
from app.models.user import User, UserRole
from app.models.client_session import ClientSession
from app.models.table import Table
from app.models.order import Order, OrderStatus
from app.models.staff_request import StaffRequest, StaffRequestType, StaffRequestStatus
from app.schemas.staff_request import BillRequestIn, StaffRequestOut
from app.ws.order_ws import order_ws_manager

router = APIRouter(tags=["Staff Requests"])


def _compute_total_due(db: Session, client_session_id: int) -> float:
    orders = (
        db.query(Order)
        .filter(
            Order.client_session_id == client_session_id,
            Order.status != OrderStatus.cancelled,
        )
        .all()
    )
    return float(sum(float(o.total) for o in orders))


def _to_out(req: StaffRequest, table: Table, session: ClientSession, total_due: float) -> StaffRequestOut:
    message = f"{session.prenom} {session.nom} — Table {table.table_number} demande l'addition ({total_due:.2f} DT)"
    return StaffRequestOut(
        id=req.id,
        restaurant_id=req.restaurant_id,
        table_id=req.table_id,
        table_number=table.table_number,
        client_session_id=req.client_session_id,
        nom=session.nom,
        prenom=session.prenom,
        type=req.type.value,
        status=req.status.value,
        total_due=total_due,
        message=message,
    )


@router.post("/staff-requests/bill", response_model=StaffRequestOut, status_code=201)
async def request_bill(payload: BillRequestIn, db: Session = Depends(get_db)):
    session = db.query(ClientSession).filter(ClientSession.id == payload.client_session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session client introuvable.")

    ensure_client_session_valid(session)

    table = db.query(Table).filter(Table.id == session.table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table introuvable.")

    # Évite les doublons: si une demande "bill" pending existe déjà pour cette session, la renvoyer
    existing = (
        db.query(StaffRequest)
        .filter(
            StaffRequest.client_session_id == session.id,
            StaffRequest.type == StaffRequestType.bill,
            StaffRequest.status == StaffRequestStatus.pending,
        )
        .first()
    )

    total_due = _compute_total_due(db, session.id)

    if existing:
        return _to_out(existing, table, session, total_due)

    req = StaffRequest(
        restaurant_id=session.restaurant_id,
        table_id=session.table_id,
        client_session_id=session.id,
        type=StaffRequestType.bill,
        status=StaffRequestStatus.pending,
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    result = _to_out(req, table, session, total_due)

    await order_ws_manager.broadcast(
        session.restaurant_id,
        {
            "type": "bill_requested",
            "staff_request_id": req.id,
            "table_id": table.id,
            "table_number": table.table_number,
            "message": result.message,
            "total_due": total_due,
        },
    )

    return result


@router.get("/staff/staff-requests", response_model=list[StaffRequestOut])
def list_pending_requests(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.employe, UserRole.admin, UserRole.super_admin)),
):
    requests = (
        db.query(StaffRequest)
        .filter(
            StaffRequest.restaurant_id == restaurant_id,
            StaffRequest.status == StaffRequestStatus.pending,
        )
        .order_by(StaffRequest.id.asc())
        .all()
    )

    out = []
    for req in requests:
        table = db.query(Table).filter(Table.id == req.table_id).first()
        session = db.query(ClientSession).filter(ClientSession.id == req.client_session_id).first()
        if not table or not session:
            continue
        total_due = _compute_total_due(db, session.id)
        out.append(_to_out(req, table, session, total_due))
    return out


@router.patch("/staff/staff-requests/{request_id}/handle", response_model=StaffRequestOut)
async def handle_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.employe, UserRole.admin, UserRole.super_admin)),
):
    req = db.query(StaffRequest).filter(StaffRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Demande introuvable.")

    req.status = StaffRequestStatus.handled
    db.commit()
    db.refresh(req)

    table = db.query(Table).filter(Table.id == req.table_id).first()
    session = db.query(ClientSession).filter(ClientSession.id == req.client_session_id).first()
    total_due = _compute_total_due(db, session.id)

    await order_ws_manager.broadcast(
        req.restaurant_id,
        {"type": "staff_request_handled", "staff_request_id": req.id},
    )

    return _to_out(req, table, session, total_due)