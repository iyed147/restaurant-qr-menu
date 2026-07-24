from pydantic import BaseModel, Field
from typing import Optional


class ClientSessionStartIn(BaseModel):
    restaurant_id: int = Field(gt=0)
    table_token: str = Field(min_length=8, max_length=120)
    nom: str = Field(min_length=2, max_length=120)
    prenom: str = Field(min_length=2, max_length=120)
    telephone: Optional[str] = Field(default=None, max_length=30)


class ClientSessionStartOut(BaseModel):
    client_session_id: int
    restaurant_id: int
    table_id: int
    table_number: int
    nom: str
    prenom: str
    telephone: Optional[str] = None