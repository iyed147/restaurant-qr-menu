import uuid

def _start_session(client, table_token="Q0cYSYja8DOhAbtBeJUAwQ"):
    r = client.post("/api/v1/client-sessions/start", json={
        "restaurant_id": 1,
        "table_token": table_token,
        "nom": "Pytest",
        "prenom": "Order",
    })
    return r.json()["client_session_id"]


def test_create_order_success(client):
    session_id = _start_session(client)
    key = str(uuid.uuid4())
    r = client.post("/api/v1/orders", json={
        "client_session_id": session_id,
        "idempotency_key": key,
        "items": [{"menu_item_id": 2, "quantity": 1}],
    })
    assert r.status_code == 201
    assert r.json()["status"] == "sent"


def test_create_order_idempotent(client):
    session_id = _start_session(client)
    key = str(uuid.uuid4())
    body = {
        "client_session_id": session_id,
        "idempotency_key": key,
        "items": [{"menu_item_id": 2, "quantity": 1}],
    }
    r1 = client.post("/api/v1/orders", json=body)
    r2 = client.post("/api/v1/orders", json=body)
    assert r1.json()["id"] == r2.json()["id"]


def test_create_order_unavailable_item_409(client):
    session_id = _start_session(client)
    r = client.post("/api/v1/orders", json={
        "client_session_id": session_id,
        "idempotency_key": str(uuid.uuid4()),
        "items": [{"menu_item_id": 999999, "quantity": 1}],
    })
    assert r.status_code == 404