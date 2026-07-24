from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.models.category import Category
from app.models.menu_item import MenuItem
from app.schemas.menu import CategoryWithItemsOut, MenuItemOut

router = APIRouter(prefix="/menu", tags=["Menu"])


@router.get("/{restaurant_id}", response_model=list[CategoryWithItemsOut])
def get_public_menu(
    restaurant_id: int,
    include_unavailable: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.is_active.is_(True)
    ).first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant introuvable ou inactif.")

    categories = (
        db.query(Category)
        .filter(Category.restaurant_id == restaurant_id)
        .order_by(Category.id.asc())
        .all()
    )

    if not categories:
        return []

    result: list[CategoryWithItemsOut] = []

    for cat in categories:
        q = db.query(MenuItem).filter(
            MenuItem.restaurant_id == restaurant_id,
            MenuItem.category_id == cat.id,
        )
        if not include_unavailable:
            q = q.filter(MenuItem.is_available.is_(True))

        items = q.order_by(MenuItem.id.asc()).all()

        result.append(
            CategoryWithItemsOut(
                id=cat.id,
                name_fr=cat.name_fr,
                name_en=cat.name_en,
                items=[MenuItemOut.model_validate(i) for i in items],
            )
        )

    return result