from fastapi import FastAPI
from app.api.v1.router import api_router
from app.ws.order_ws import router as ws_router
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings


app = FastAPI(title="Restaurant QR Menu API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router, prefix="/api/v1")
app.include_router(ws_router)



@app.get("/health")
def health():
    return {"status": "ok"}