def _get_token(client):
    r = client.post("/api/v1/auth/login", json={
        "email": "employe1@test.com",
        "password": "motdepasse123",
    })
    return r.json()["access_token"]


def test_staff_orders_requires_auth(client):
    r = client.get("/api/v1/staff/orders?restaurant_id=1")
    assert r.status_code == 401


def test_staff_orders_with_auth(client):
    token = _get_token(client)
    r = client.get(
        "/api/v1/staff/orders?restaurant_id=1",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)