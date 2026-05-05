from unittest.mock import patch
import pytest
pytestmark = pytest.mark.integration

def test_upload_book_success(client):
    client.post("/auth/register", json={"username": "bookuser", "password": "pass"})
    login = client.post("/auth/login", data={"username": "bookuser", "password": "pass"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    with patch("app.services.s3_service.S3Service.upload_file") as mock_upload:
        mock_upload.return_value = "test-key.txt"
        files = {"book_file": ("test.txt", b"Content of the book", "text/plain")}
        data = {"title": "Test Book", "author": "Test Author"}
        response = client.post("/books/upload", files=files, data=data, headers=headers)

    assert response.status_code == 200
    book = response.json()
    assert book["title"] == "Test Book"
    assert book["author"] == "Test Author"

def test_upload_book_invalid_file_type(client):
    client.post("/auth/register", json={"username": "bookuser2", "password": "pass"})
    login = client.post("/auth/login", data={"username": "bookuser2", "password": "pass"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    files = {"book_file": ("test.pdf", b"Content", "application/pdf")}
    data = {"title": "Test Book", "author": "Test Author"}
    response = client.post("/books/upload", files=files, data=data, headers=headers)
    assert response.status_code == 400
    assert "Only TXT files" in response.text

def test_get_books_empty_list(client):
    client.post("/auth/register", json={"username": "emptyuser", "password": "pass"})
    login = client.post("/auth/login", data={"username": "emptyuser", "password": "pass"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/books/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0