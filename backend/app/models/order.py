import enum
import datetime
from sqlalchemy import DateTime, func
from sqlalchemy import Integer, String, ForeignKey, Enum, Numeric, UniqueConstraint, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class OrderStatus(str, enum.Enum):
    sent = "sent"
    preparing = "preparing"
    served = "served"
    completed = "completed"
    cancelled = "cancelled"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id"), nullable=False, index=True)
    table_id: Mapped[int] = mapped_column(ForeignKey("tables.id"), nullable=False, index=True)
    client_session_id: Mapped[int] = mapped_column(ForeignKey("client_sessions.id"), nullable=False, index=True)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus, name="order_status"), default=OrderStatus.sent, nullable=False)
    total: Mapped[float] = mapped_column(Numeric(10, 3), default=0, nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
    DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("client_session_id", "idempotency_key", name="uq_order_client_idempotency"),
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False, index=True)
    menu_item_id: Mapped[int] = mapped_column(ForeignKey("menu_items.id"), nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    line_total: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    note: Mapped[str | None] = mapped_column(String(300), nullable=True)