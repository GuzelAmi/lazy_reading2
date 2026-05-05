import pytest
pytestmark = pytest.mark.integration


def test_register_success(client):
    response = client.post("/auth/register", json={
        "username": "newuser",
        "password": "newpass"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "newuser"
    assert "id" in data
    assert data["role"] == "user"

def test_register_duplicate_username(client):
    client.post("/auth/register", json={"username": "duplicate", "password": "pass"})
    response = client.post("/auth/register", json={"username": "duplicate", "password": "pass"})
    assert response.status_code == 400
    assert "already registered" in response.text

def test_login_success(client):
    client.post("/auth/register", json={"username": "loginuser", "password": "pass"})
    response = client.post("/auth/login", data={
        "username": "loginuser",
        "password": "pass"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client):
    client.post("/auth/register", json={"username": "wrongpass", "password": "correct"})
    response = client.post("/auth/login", data={
        "username": "wrongpass",
        "password": "wrong"
    })
    assert response.status_code == 401

def test_refresh_token_success(client):
    client.post("/auth/register", json={"username": "refreshme", "password": "pass"})
    login_resp = client.post("/auth/login", data={"username": "refreshme", "password": "pass"})
    refresh_token = login_resp.json()["refresh_token"]

    response = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

def test_refresh_token_invalid(client):
    response = client.post("/auth/refresh", json={"refresh_token": "invalid-token"})
    assert response.status_code == 401

def test_logout_success(client):
    client.post("/auth/register", json={"username": "logoutme", "password": "pass"})
    login_resp = client.post("/auth/login", data={"username": "logoutme", "password": "pass"})
    refresh_token = login_resp.json()["refresh_token"]

    response = client.post("/auth/logout", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    assert "Logged out" in response.text

    response = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 401

def test_get_me_requires_auth(client):
    response = client.get("/auth/me")
    assert response.status_code == 401

def test_get_me_returns_user(client):
    client.post("/auth/register", json={"username": "meuser", "password": "pass"})
    login = client.post("/auth/login", data={"username": "meuser", "password": "pass"})
    token = login.json()["access_token"]

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "meuser"