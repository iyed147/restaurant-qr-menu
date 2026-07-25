from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.order import Order, OrderStatus
from app.models.review import Review
from app.schemas.review import ReviewCreateIn, ReviewOut

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(payload: ReviewCreateIn, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable.")

    if order.status != OrderStatus.completed:
        raise HTTPException(status_code=409, detail="Avis autorisé uniquement pour une commande terminée.")

    # 1 avis max par commande
    exists = db.query(Review).filter(Review.order_id == payload.order_id).first()
    if exists:
        raise HTTPException(status_code=409, detail="Un avis existe déjà pour cette commande.")

    review = Review(
        restaurant_id=order.restaurant_id,
        order_id=order.id,
        rating=payload.rating,
        comment=payload.comment.strip() if payload.comment else None,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review