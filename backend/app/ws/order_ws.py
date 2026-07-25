from collections import defaultdict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json


class OrderWSManager:
    def __init__(self):
        self.connections: Dict[int, Set[WebSocket]] = defaultdict(set)

    async def connect(self, restaurant_id: int, websocket: WebSocket):
        await websocket.accept()
        self.connections[restaurant_id].add(websocket)

    def disconnect(self, restaurant_id: int, websocket: WebSocket):
        if restaurant_id in self.connections and websocket in self.connections[restaurant_id]:
            self.connections[restaurant_id].remove(websocket)

    async def broadcast(self, restaurant_id: int, event: dict):
        dead = []
        for ws in self.connections.get(restaurant_id, set()):
            try:
                await ws.send_text(json.dumps(event))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(restaurant_id, ws)


order_ws_manager = OrderWSManager()

router = APIRouter(tags=["WebSocket Orders"])


@router.websocket("/ws/orders/{restaurant_id}")
async def orders_ws_endpoint(websocket: WebSocket, restaurant_id: int):
    await order_ws_manager.connect(restaurant_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        order_ws_manager.disconnect(restaurant_id, websocket)