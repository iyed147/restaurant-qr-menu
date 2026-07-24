from pydantic import BaseModel
from typing import Optional, List


class MenuItemOut(BaseModel):
    id: int
    category_id: int
    name_fr: str
    name_en: str
    description_fr: Optional[str] = None
    description_en: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_available: bool

    model_config = {"from_attributes": True}


class CategoryWithItemsOut(BaseModel):
    id: int
    name_fr: str
    name_en: str
    items: List[MenuItemOut]