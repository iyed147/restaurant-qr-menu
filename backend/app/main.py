from fastapi import FastAPI
from app.api.v1.router import api_router
from app.ws.order_ws import router as ws_router


app = FastAPI(title="Restaurant QR Menu API", version="0.1.0")

app.include_router(api_router, prefix="/api/v1")
app.include_router(ws_router)


@app.get("/health")
def health():
    return {"status": "ok"}