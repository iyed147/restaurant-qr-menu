import uuid

def _get_token(client):
    r = client.post("/api/v1/auth/login", json={
        "email": "employe1@test.com",
        "password": "motdepasse123",
    })
    return r.json()["access_token"]


def _create_completed_order(client, token):
    r = client.post("/api/v1/client-sessions/start", json={
        "restaurant_id": 1,
        "table_token": "Q0cYSYja8DOhAbtBeJUAwQ",
        "nom": "Review",
        "prenom": "Test",
    })
    session_id = r.json()["client_session_id"]

    r = client.post("/api/v1/orders", json={
        "client_session_id": session_id,
        "idempotency_key": str(uuid.uuid4()),
        "items": [{"menu_item_id": 2, "quantity": 1}],
    })
    order_id = r.json()["id"]

    headers = {"Authorization": f"Bearer {token}"}
    for status in ["preparing", "served", "completed"]:
        client.patch(f"/api/v1/staff/orders/{order_id}/status", json={"status": status}, headers=headers)

    return order_id


def test_review_rejected_before_completed(client):
    token = _get_token(client)
    r = client.post("/api/v1/client-sessions/start", json={
        "restaurant_id": 1,
        "table_token": "Q0cYSYja8DOhAbtBeJUAwQ",
        "nom": "Review",
        "prenom": "Test",
    })
    session_id = r.json()["client_session_id"]
    r = client.post("/api/v1/orders", json={
        "client_session_id": session_id,
        "idempotency_key": str(uuid.uuid4()),
        "items": [{"menu_item_id": 2, "quantity": 1}],
    })
    order_id = r.json()["id"]

    r = client.post("/api/v1/reviews", json={"order_id": order_id, "rating": 5})
    assert r.status_code == 409


def test_review_created_after_completed_and_duplicate_rejected(client):
    token = _get_token(client)
    order_id = _create_completed_order(client, token)

    r1 = client.post("/api/v1/reviews", json={"order_id": order_id, "rating": 5, "comment": "Top"})
    assert r1.status_code == 201

    r2 = client.post("/api/v1/reviews", json={"order_id": order_id, "rating": 4})
    assert r2.status_code == 409