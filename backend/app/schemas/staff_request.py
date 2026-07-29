from pydantic import BaseModel


class BillRequestIn(BaseModel):
    client_session_id: int


class StaffRequestOut(BaseModel):
    id: int
    restaurant_id: int
    table_id: int
    table_number: int
    client_session_id: int
    nom: str
    prenom: str
    type: str
    status: str
    total_due: float
    message: str

    class Config:
        from_attributes = True