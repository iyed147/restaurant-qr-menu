import secrets
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import hash_password
from app.core.deps import require_roles
from app.models.restaurant import Restaurant
from app.models.category import Category
from app.models.menu_item import MenuItem
from app.models.table import Table
from app.models.user import User, UserRole
from app.models.audit_log import AdminAuditLog
from app.schemas.admin import (
    AdminMenuItemCreateIn, AdminMenuItemUpdateIn, AdminAvailabilityIn,
    AdminTableCreateIn, AdminTableActiveIn,
    AdminUserCreateIn, AdminUserRoleUpdateIn,
    AdminCategoryCreateIn
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_roles(UserRole.admin, UserRole.super_admin))],
)


def write_audit(db: Session, restaurant_id: int, admin_user_id: int | None, action: str, target_type: str, target_id: int):
    db.add(AdminAuditLog(
        restaurant_id=restaurant_id,
        admin_user_id=admin_user_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
    ))


@router.post("/categories")
def create_category(payload: AdminCategoryCreateIn, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.admin, UserRole.super_admin))):
    restaurant = db.query(Restaurant).filter(Restaurant.id == payload.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant introuvable.")

    exists = db.query(Category).filter(
        Category.restaurant_id == payload.restaurant_id,
        Category.name_fr == payload.name_fr
    ).first()
    if exists:
        raise HTTPException(status_code=409, detail="Cette catégorie existe déjà.")

    category = Category(
        restaurant_id=payload.restaurant_id,
        name_fr=payload.name_fr,
        name_en=payload.name_en,
    )
    db.add(category)
    db.flush()

    write_audit(db, payload.restaurant_id, current_user.id, "create_category", "category", category.id)
    db.commit()
    return {"id": category.id, "message": "Catégorie créée."}


@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.admin, UserRole.super_admin))):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Catégorie introuvable.")

    items_count = db.query(MenuItem).filter(MenuItem.category_id == category_id).count()
    if items_count > 0:
        raise HTTPException(status_code=409, detail="Impossible de supprimer une catégorie contenant des produits.")

    write_audit(db, category.restaurant_id, current_user.id, "delete_category", "category", category.id)
    db.delete(category)
    db.commit()
    return {"message": "Catégorie supprimée."}

@router.post("/menu-items")
def create_menu_item(payload: AdminMenuItemCreateIn, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.admin, UserRole.super_admin))):
    restaurant = db.query(Restaurant).filter(Restaurant.id == payload.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant introuvable.")

    category = db.query(Category).filter(
        Category.id == payload.category_id,
        Category.restaurant_id == payload.restaurant_id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Catégorie introuvable pour ce restaurant.")

    item = MenuItem(
        restaurant_id=payload.restaurant_id,
        category_id=payload.category_id,
        name_fr=payload.name_fr,
        name_en=payload.name_en,
        description_fr=payload.description_fr,
        description_en=payload.description_en,
        price=payload.price,
        image_url=payload.image_url,
        is_available=payload.is_available
    )
    db.add(item)
    db.flush()

    write_audit(db, payload.restaurant_id, current_user.id, "create_menu_item", "menu_item", item.id)
    db.commit()
    return {"id": item.id, "message": "Menu item créé."}


@router.patch("/menu-items/{item_id}")
def update_menu_item(item_id: int, payload: AdminMenuItemUpdateIn, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.admin, UserRole.super_admin))):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item introuvable.")

    for field in ["name_fr", "name_en", "description_fr", "description_en", "price", "image_url"]:
        val = getattr(payload, field)
        if val is not None:
            setattr(item, field, val)

    write_audit(db, item.restaurant_id, current_user.id, "update_menu_item", "menu_item", item.id)
    db.commit()
    return {"message": "Menu item mis à jour."}


@router.patch("/menu-items/{item_id}/availability")
def toggle_menu_item_availability(item_id: int, payload: AdminAvailabilityIn, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.admin, UserRole.super_admin))):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item introuvable.")

    item.is_available = payload.is_available
    write_audit(db, item.restaurant_id, current_user.id, "toggle_menu_item_availability", "menu_item", item.id)
    db.commit()
    return {"message": "Disponibilité mise à jour."}

@router.delete("/menu-items/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.admin, UserRole.super_admin))):
    from app.models.order import OrderItem

    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item introuvable.")

    has_orders = db.query(OrderItem).filter(OrderItem.menu_item_id == item_id).first()
    if has_orders:
        raise HTTPException(
            status_code=409,
            detail="Ce produit a déjà été commandé et ne peut pas être supprimé. Utilisez 'Marquer indisponible' à la place."
        )

    write_audit(db, item.restaurant_id, current_user.id, "delete_menu_item", "menu_item", item.id)
    db.delete(item)
    db.commit()
    return {"message": "Menu item supprimé."}


@router.post("/tables")
def create_table(payload: AdminTableCreateIn, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.admin, UserRole.super_admin))):
    restaurant = db.query(Restaurant).filter(Restaurant.id == payload.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant introuvable.")

    exists = db.query(Table).filter(
        Table.restaurant_id == payload.restaurant_id,
        Table.table_number == payload.table_number
    ).first()
    if exists:
        raise HTTPException(status_code=409, detail="Numéro de table déjà existant.")

    t = Table(
        restaurant_id=payload.restaurant_id,
        table_number=payload.table_number,
        table_token=secrets.token_urlsafe(16),
        is_active=True
    )
    db.add(t)
    db.flush()

    write_audit(db, payload.restaurant_id, current_user.id, "create_table", "table", t.id)
    db.commit()
    return {"id": t.id, "table_token": t.table_token, "message": "Table créée."}


@router.get("/tables")
def list_tables(restaurant_id: int = Query(..., gt=0), db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.admin, UserRole.super_admin))):
    tables = db.query(Table).filter(Table.restaurant_id == restaurant_id).order_by(Table.table_number.asc()).all()
    return [
        {
            "id": t.id,
            "table_number": t.table_number,
            "table_token": t.table_token,
            "is_active": t.is_active,
        } for t in tables
    ]


@router.patch("/tables/{table_id}/active")
def set_table_active(table_id: int, payload: AdminTableActiveIn, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.admin, UserRole.super_admin))):
    t = db.query(Table).filter(Table.id == table_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Table introuvable.")

    t.is_active = payload.is_active
    write_audit(db, t.restaurant_id, current_user.id, "set_table_active", "table", t.id)
    db.commit()
    return {"message": "Statut table mis à jour."}


@router.post("/users")
def create_user(payload: AdminUserCreateIn, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.admin, UserRole.super_admin))):
    restaurant = db.query(Restaurant).filter(Restaurant.id == payload.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant introuvable.")

    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=409, detail="Email déjà utilisé.")

    user = User(
        restaurant_id=payload.restaurant_id,
        email=payload.email,
        password_hash=hash_password(payload.password),
        nom=payload.nom,
        prenom=payload.prenom,
        role=payload.role,
    )
    db.add(user)
    db.flush()

    write_audit(db, payload.restaurant_id, current_user.id, "create_user", "user", user.id)
    db.commit()
    return {"id": user.id, "message": "Utilisateur créé."}


@router.get("/users")
def list_users(restaurant_id: int = Query(..., gt=0), db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.admin, UserRole.super_admin))):
    users = db.query(User).filter(User.restaurant_id == restaurant_id).order_by(User.id.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "nom": u.nom,
            "prenom": u.prenom,
            "role": u.role.value if hasattr(u.role, "value") else str(u.role),
        } for u in users
    ]


@router.patch("/users/{user_id}/role")
def update_user_role(user_id: int, payload: AdminUserRoleUpdateIn, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.admin, UserRole.super_admin))):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas modifier votre propre rôle.")

    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    u.role = payload.role
    write_audit(db, u.restaurant_id, current_user.id, "update_user_role", "user", u.id)
    db.commit()
    return {"message": "Rôle utilisateur mis à jour."}