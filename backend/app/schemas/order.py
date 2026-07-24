from pydantic import BaseModel, Field
from typing import Optional, List


class OrderItemCreateIn(BaseModel):
    menu_item_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=50)
    note: Optional[str] = Field(default=None, max_length=300)


class OrderCreateIn(BaseModel):
    client_session_id: int = Field(gt=0)
    idempotency_key: str = Field(min_length=8, max_length=64)
    items: List[OrderItemCreateIn] = Field(min_length=1)


class OrderItemOut(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    unit_price: float
    line_total: float
    note: Optional[str] = None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    restaurant_id: int
    table_id: int
    client_session_id: int
    status: str
    total: float
    idempotency_key: str
    items: List[OrderItemOut]


class OrderItemUpdateIn(BaseModel):
    menu_item_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=50)
    note: Optional[str] = Field(default=None, max_length=300)


class OrderUpdateIn(BaseModel):
    items: List[OrderItemUpdateIn] = Field(min_length=1)