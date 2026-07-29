from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from app.models.user import UserRole


class AdminMenuItemCreateIn(BaseModel):
    restaurant_id: int = Field(gt=0)
    category_id: int = Field(gt=0)
    name_fr: str = Field(min_length=1, max_length=150)
    name_en: str = Field(min_length=1, max_length=150)
    description_fr: Optional[str] = Field(default=None, max_length=500)
    description_en: Optional[str] = Field(default=None, max_length=500)
    price: float = Field(gt=0)
    image_url: Optional[str] = Field(default=None, max_length=500)
    is_available: bool = True


class AdminMenuItemUpdateIn(BaseModel):
    name_fr: Optional[str] = Field(default=None, min_length=1, max_length=150)
    name_en: Optional[str] = Field(default=None, min_length=1, max_length=150)
    description_fr: Optional[str] = Field(default=None, max_length=500)
    description_en: Optional[str] = Field(default=None, max_length=500)
    price: Optional[float] = Field(default=None, gt=0)
    image_url: Optional[str] = Field(default=None, max_length=500)


class AdminAvailabilityIn(BaseModel):
    is_available: bool


class AdminTableCreateIn(BaseModel):
    restaurant_id: int = Field(gt=0)
    table_number: int = Field(gt=0)


class AdminTableActiveIn(BaseModel):
    is_active: bool


class AdminUserCreateIn(BaseModel):
    restaurant_id: int = Field(gt=0)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    nom: str = Field(min_length=1, max_length=120)
    prenom: str = Field(min_length=1, max_length=120)
    role: UserRole


class AdminUserRoleUpdateIn(BaseModel):
    role: UserRole


class AdminCategoryCreateIn(BaseModel):
    restaurant_id: int = Field(gt=0)
    name_fr: str = Field(min_length=1, max_length=100)
    name_en: str = Field(min_length=1, max_length=100)