import pytest
pytestmark = pytest.mark.integration


def test_admin_get_users_requires_admin(client):
    # Регистрируем обычного пользователя
    client.post("/auth/register", json={"username": "regular", "password": "pass"})
    login = client.post("/auth/login", data={"username": "regular", "password": "pass"})
    token = login.json()["access_token"]


    response = client.get("/admin/users", headers={"Authorization": f"Bearer {token}"})
    

    assert response.status_code == 403

def test_admin_update_role_requires_admin(client):

    client.post("/auth/register", json={"username": "target", "password": "pass"})
    client.post("/auth/register", json={"username": "attacker", "password": "pass"})

    login = client.post("/auth/login", data={"username": "attacker", "password": "pass"})
    token = login.json()["access_token"]
    

    response = client.put(
        "/admin/users/999/role",
        params={"role": "admin"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403