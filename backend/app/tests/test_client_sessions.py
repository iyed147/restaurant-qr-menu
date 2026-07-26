def test_start_session_invalid_token_404(client):
    r = client.post("/api/v1/client-sessions/start", json={
        "restaurant_id": 1,
        "table_token": "invalid_token_xyz",
        "nom": "Test",
        "prenom": "User",
    })
    assert r.status_code == 404

def test_start_session_valid_token(client):
    r = client.post("/api/v1/client-sessions/start", json={
        "restaurant_id": 1,
        "table_token": "Q0cYSYja8DOhAbtBeJUAwQ",
        "nom": "Test",
        "prenom": "User",
    })
    assert r.status_code == 201
    assert "client_session_id" in r.json()