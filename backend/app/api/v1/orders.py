from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone, timedelta

from app.db.session import get_db
from app.models.client_session import ClientSession
from app.models.menu_item import MenuItem
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.order import OrderCreateIn, OrderUpdateIn, OrderOut, OrderItemOut
from app.ws.order_ws import order_ws_manager

router = APIRouter(prefix="/orders", tags=["Orders"])

EDIT_WINDOW_SECONDS = 30


def _order_to_out(order: Order, items: list[OrderItem]) -> OrderOut:
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


def _ensure_order_editable(order: Order):
    if order.status != OrderStatus.sent:
        raise HTTPException(status_code=409, detail="Commande non modifiable (status).")
    now = datetime.now(timezone.utc)
    created = order.created_at
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    if now - created > timedelta(seconds=EDIT_WINDOW_SECONDS):
        raise HTTPException(status_code=409, detail="Fenêtre de modification expirée (30s).")


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(payload: OrderCreateIn, db: Session = Depends(get_db)):
    # 1) Idempotence: return existing order if same key already used
    existing = (
        db.query(Order)
        .filter(
            Order.client_session_id == payload.client_session_id,
            Order.idempotency_key == payload.idempotency_key.strip(),
        )
        .first()
    )
    if existing:
        existing_items = db.query(OrderItem).filter(OrderItem.order_id == existing.id).all()
        return _order_to_out(existing, existing_items)

    # 2) Session client valide
    client_session = db.query(ClientSession).filter(ClientSession.id == payload.client_session_id).first()
    if not client_session:
        raise HTTPException(status_code=404, detail="Client session introuvable.")

    # 3) Vérifier disponibilité des items AVANT insertion (concurrence stock)
    requested_ids = [i.menu_item_id for i in payload.items]
    menu_items = (
        db.query(MenuItem)
        .filter(
            MenuItem.id.in_(requested_ids),
            MenuItem.restaurant_id == client_session.restaurant_id,
        )
        .all()
    )
    by_id = {m.id: m for m in menu_items}

    for it in payload.items:
        m = by_id.get(it.menu_item_id)
        if not m:
            raise HTTPException(status_code=404, detail=f"Produit {it.menu_item_id} introuvable.")
        if not m.is_available:
            raise HTTPException(
                status_code=409,
                detail=f"Produit '{m.name_fr}' indisponible actuellement.",
            )

    # 4) Transaction commande + lignes
    order = Order(
        restaurant_id=client_session.restaurant_id,
        table_id=client_session.table_id,
        client_session_id=client_session.id,
        status=OrderStatus.sent,
        total=0,
        idempotency_key=payload.idempotency_key.strip(),
    )

    try:
        db.add(order)
        db.flush()  # get order.id

        total = 0.0

        for it in payload.items:
            m = by_id[it.menu_item_id]
            unit_price = float(m.price)
            line_total = unit_price * it.quantity
            total += line_total

            oi = OrderItem(
                order_id=order.id,
                menu_item_id=m.id,
                quantity=it.quantity,
                unit_price=unit_price,
                line_total=line_total,
                note=it.note.strip() if it.note else None,
            )
            db.add(oi)

        order.total = total
        db.commit()

    except IntegrityError:
        db.rollback()
        # Cas double submit simultané: renvoyer commande existante
        again = (
            db.query(Order)
            .filter(
                Order.client_session_id == payload.client_session_id,
                Order.idempotency_key == payload.idempotency_key.strip(),
            )
            .first()
        )
        if again:
            again_items = db.query(OrderItem).filter(OrderItem.order_id == again.id).all()
            return _order_to_out(again, again_items)
        raise HTTPException(status_code=409, detail="Conflit idempotence commande.")

    db.refresh(order)
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    result = _order_to_out(order, order_items)

    # Broadcast WS: nouvelle commande
    await order_ws_manager.broadcast(
        order.restaurant_id,
        {"type": "order_created", "order": result.model_dump()},
    )

    return result


@router.patch("/{order_id}", response_model=OrderOut)
async def update_order(order_id: int, payload: OrderUpdateIn, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable.")

    _ensure_order_editable(order)

    # vérifier disponibilité items
    requested_ids = [i.menu_item_id for i in payload.items]
    menu_items = db.query(MenuItem).filter(
        MenuItem.id.in_(requested_ids),
        MenuItem.restaurant_id == order.restaurant_id,
    ).all()
    by_id = {m.id: m for m in menu_items}

    for it in payload.items:
        m = by_id.get(it.menu_item_id)
        if not m:
            raise HTTPException(status_code=404, detail=f"Produit {it.menu_item_id} introuvable.")
        if not m.is_available:
            raise HTTPException(status_code=409, detail=f"Produit '{m.name_fr}' indisponible actuellement.")

    # remplacer toutes les lignes (simple et propre)
    db.query(OrderItem).filter(OrderItem.order_id == order.id).delete()

    total = 0.0
    for it in payload.items:
        m = by_id[it.menu_item_id]
        unit_price = float(m.price)
        line_total = unit_price * it.quantity
        total += line_total
        db.add(OrderItem(
            order_id=order.id,
            menu_item_id=m.id,
            quantity=it.quantity,
            unit_price=unit_price,
            line_total=line_total,
            note=it.note.strip() if it.note else None,
        ))

    order.total = total
    db.commit()
    db.refresh(order)

    order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    result = _order_to_out(order, order_items)

    # Broadcast WS: commande modifiée
    await order_ws_manager.broadcast(
        order.restaurant_id,
        {"type": "order_updated", "order": result.model_dump()},
    )

    return result


@router.delete("/{order_id}")
async def cancel_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable.")

    _ensure_order_editable(order)

    order.status = OrderStatus.cancelled
    db.commit()

    # Broadcast WS: commande annulée
    await order_ws_manager.broadcast(
        order.restaurant_id,
        {
            "type": "order_cancelled",
            "order_id": order.id,
            "table_id": order.table_id,
            "restaurant_id": order.restaurant_id,
        },
    )

    return {"message": "Commande annulée avec succès."}