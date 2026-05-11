from app.auth import get_password_hash
from app.models import User

def test_admin_get_users_requires_admin(client):
    client.post("/auth/register", json={"username": "regular", "password": "pass"})
    login = client.post("/auth/login", data={"username": "regular", "password": "pass"})
    token = login.json()["access_token"]

    response = client.get("/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403  # Доступ запрещён

def test_admin_get_users_success(client, db):

    admin = User(username="adminuser", hashed_password=get_password_hash("adminpass"), role="admin")
    db.add(admin)
    db.commit()

    login = client.post("/auth/login", data={"username": "adminuser", "password": "adminpass"})
    token = login.json()["access_token"]
    response = client.get("/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200  
    assert len(response.json()) >= 1

def test_admin_update_role_success(client, db):
    admin = User(username="adminrole", hashed_password=get_password_hash("adminpass"), role="admin")
    user = User(username="targetuser", hashed_password=get_password_hash("pass"), role="user")
    db.add(admin)
    db.add(user)
    db.commit()

    login = client.post("/auth/login", data={"username": "adminrole", "password": "adminpass"})
    token = login.json()["access_token"]

    response = client.put(
        f"/admin/users/{user.id}/role",
        params={"role": "admin"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert "role updated" in response.text