import secrets
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.restaurant import Restaurant
from app.models.table import Table
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.menu_item import MenuItem
from app.core.security import hash_password


def run():
    db: Session = SessionLocal()
    try:
        restaurant = db.query(Restaurant).filter(
            Restaurant.slug == "demo-cafe"
        ).first()

        if not restaurant:
            restaurant = Restaurant(
                name="Demo Café",
                slug="demo-cafe",
                is_active=True,
            )
            db.add(restaurant)
            db.flush()

        # Admin du restaurant
        admin = db.query(User).filter(
            User.email == "admin@demo.local"
        ).first()

        if not admin:
            admin = User(
                restaurant_id=restaurant.id,
                nom="Admin",
                prenom="Demo",
                email="admin@demo.local",
                password_hash=hash_password("Admin123!"),
                role=UserRole.admin,
            )
            db.add(admin)

        # Super admin
        super_admin = db.query(User).filter(
            User.email == "super@platform.local"
        ).first()

        if not super_admin:
            super_admin = User(
                restaurant_id=None,
                nom="Super",
                prenom="Admin",
                email="super@platform.local",
                password_hash=hash_password("Super123!"),
                role=UserRole.super_admin,
            )
            db.add(super_admin)

        # Tables
        for n in range(1, 11):
            exists = (
                db.query(Table)
                .filter(
                    Table.restaurant_id == restaurant.id,
                    Table.table_number == n,
                )
                .first()
            )

            if not exists:
                db.add(
                    Table(
                        restaurant_id=restaurant.id,
                        table_number=n,
                        table_token=secrets.token_urlsafe(16),
                        is_active=True,
                    )
                )

        # ==========================
        # Categories
        # ==========================

        boissons = (
            db.query(Category)
            .filter(
                Category.restaurant_id == restaurant.id,
                Category.name_fr == "Boissons",
            )
            .first()
        )

        if not boissons:
            boissons = Category(
                restaurant_id=restaurant.id,
                name_fr="Boissons",
                name_en="Drinks",
            )
            db.add(boissons)
            db.flush()

        desserts = (
            db.query(Category)
            .filter(
                Category.restaurant_id == restaurant.id,
                Category.name_fr == "Desserts",
            )
            .first()
        )

        if not desserts:
            desserts = Category(
                restaurant_id=restaurant.id,
                name_fr="Desserts",
                name_en="Desserts",
            )
            db.add(desserts)
            db.flush()

        # ==========================
        # Menu Items
        # ==========================

        def ensure_item(
            category_id,
            name_fr,
            name_en,
            price,
            available=True,
            description_fr=None,
            description_en=None,
        ):
            exists = (
                db.query(MenuItem)
                .filter(
                    MenuItem.restaurant_id == restaurant.id,
                    MenuItem.category_id == category_id,
                    MenuItem.name_fr == name_fr,
                )
                .first()
            )

            if not exists:
                db.add(
                    MenuItem(
                        restaurant_id=restaurant.id,
                        category_id=category_id,
                        name_fr=name_fr,
                        name_en=name_en,
                        description_fr=description_fr,
                        description_en=description_en,
                        price=price,
                        image_url=None,
                        is_available=available,
                    )
                )

        ensure_item(
            boissons.id,
            "Espresso",
            "Espresso",
            2.500,
        )

        ensure_item(
            boissons.id,
            "Cappuccino",
            "Cappuccino",
            3.500,
        )

        ensure_item(
            desserts.id,
            "Brownie",
            "Brownie",
            4.000,
            available=False,
            description_fr="Rupture aujourd'hui",
            description_en="Out of stock today",
        )

        db.commit()
        print("✅ Seed terminé")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    run()