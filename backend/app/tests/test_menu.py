def test_get_menu_hides_unavailable_by_default(client):
    r = client.get("/api/v1/menu/1")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_get_menu_include_unavailable(client):
    r = client.get("/api/v1/menu/1?include_unavailable=true")
    assert r.status_code == 200