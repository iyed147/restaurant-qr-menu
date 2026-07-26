from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import require_roles
from app.models.user import User, UserRole
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.order import OrderOut, OrderItemOut, OrderStatusUpdateIn
from app.ws.order_ws import order_ws_manager

router = APIRouter(prefix="/staff/orders", tags=["Staff Orders"])


def _to_order_out(order: Order, items: list[OrderItem]) -> OrderOut:
    return OrderOut(
        id=order.id,
        restaurant_id=order.restaurant_id,
        table_id=order.table_id,
        client_session_id=order.client_session_id,
        status=order.status.value if hasattr(order.status, "value") else str(order.status),
        total=float(order.total),
        idempotency_key=order.idempotency_key,
        items=[OrderItemOut.model_validate(i) for i in items],
    )


@router.get("", response_model=list[OrderOut])
def list_orders(
    restaurant_id: int = Query(..., gt=0),
    status: OrderStatus | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.employe, UserRole.admin, UserRole.super_admin)),
):
    q = db.query(Order).filter(Order.restaurant_id == restaurant_id)
    if status:
        q = q.filter(Order.status == status)
    orders = q.order_by(Order.id.desc()).all()

    result = []
    for o in orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == o.id).all()
        result.append(_to_order_out(o, items))
    return result


@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    payload: OrderStatusUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.employe, UserRole.admin, UserRole.super_admin)),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable.")

    allowed = {
        OrderStatus.sent: {OrderStatus.preparing, OrderStatus.cancelled},
        OrderStatus.preparing: {OrderStatus.served},
        OrderStatus.served: {OrderStatus.completed},
        OrderStatus.completed: set(),
        OrderStatus.cancelled: set(),
    }

    current = order.status
    target = payload.status

    if target not in allowed[current]:
        raise HTTPException(
            status_code=409,
            detail=f"Transition invalide: {current.value} -> {target.value}",
        )

    order.status = target
    db.commit()
    db.refresh(order)

    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    out = _to_order_out(order, items)

    await order_ws_manager.broadcast(
        order.restaurant_id,
        {
            "type": "order_status_updated",
            "order_id": order.id,
            "restaurant_id": order.restaurant_id,
            "status": order.status.value,
        },
    )

    return out


@router.websocket("/ws/restaurants/{restaurant_id}/orders")
async def orders_ws(websocket: WebSocket, restaurant_id: int):
    await order_ws_manager.connect(restaurant_id, websocket)
    try:
        while True:
            await websocket.receive_text()  # keepalive/client ping
    except WebSocketDisconnect:
        order_ws_manager.disconnect(restaurant_id, websocket)
    except Exception:
        order_ws_manager.disconnect(restaurant_id, websocket)