import enum
from sqlalchemy import Integer, ForeignKey, Enum, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class StaffRequestType(str, enum.Enum):
    help = "help"
    bill = "bill"


class StaffRequestStatus(str, enum.Enum):
    pending = "pending"
    handled = "handled"


class StaffRequest(Base):
    __tablename__ = "staff_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id"), nullable=False, index=True)
    table_id: Mapped[int] = mapped_column(ForeignKey("tables.id"), nullable=False, index=True)
    client_session_id: Mapped[int] = mapped_column(ForeignKey("client_sessions.id"), nullable=False, index=True)
    type: Mapped[StaffRequestType] = mapped_column(Enum(StaffRequestType, name="staff_request_type"), nullable=False)
    status: Mapped[StaffRequestStatus] = mapped_column(Enum(StaffRequestStatus, name="staff_request_status"), default=StaffRequestStatus.pending, nullable=False)
    note: Mapped[str | None] = mapped_column(String(300), nullable=True)