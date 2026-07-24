from fastapi import APIRouter
from app.api.v1 import client_sessions, menu

api_router = APIRouter()
api_router.include_router(client_sessions.router)
api_router.include_router(menu.router)