from pydantic import BaseModel, Field
from typing import Optional


class ReviewCreateIn(BaseModel):
    order_id: int = Field(gt=0)
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=1000)


class ReviewOut(BaseModel):
    id: int
    restaurant_id: int
    order_id: int
    rating: int
    comment: Optional[str] = None

    model_config = {"from_attributes": True}