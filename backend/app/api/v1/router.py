from fastapi import APIRouter
from app.api.v1 import client_sessions, menu, orders, staff_orders, admin, reviews

api_router = APIRouter()
api_router.include_router(client_sessions.router)
api_router.include_router(menu.router)
api_router.include_router(orders.router)
api_router.include_router(staff_orders.router)
api_router.include_router(admin.router)
api_router.include_router(reviews.router)
