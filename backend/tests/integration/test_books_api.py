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
        files = {"book_file": ("test.txt", b"Content", "text/plain")}
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

def test_books_pagination_parameters(client):
    client.post("/auth/register", json={"username": "pageuser", "password": "pass"})
    login = client.post("/auth/login", data={"username": "pageuser", "password": "pass"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    with patch("app.services.s3_service.S3Service.upload_file") as mock_upload:
        for i in range(15):
            mock_upload.return_value = f"test-key-{i}.txt"
            files = {"book_file": ("test.txt", b"Content", "text/plain")}
            data = {"title": f"Book {i}", "author": "Author"}
            client.post("/books/upload", files=files, data=data, headers=headers)

    response = client.get("/books/?page=2&size=5", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 2
    assert data["size"] == 5
    assert data["total"] == 15
    assert data["pages"] == 3

def test_books_sorting_parameters(client):
    client.post("/auth/register", json={"username": "sortuser", "password": "pass"})
    login = client.post("/auth/login", data={"username": "sortuser", "password": "pass"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    titles = ["Zebra", "Apple", "Monkey"]
    with patch("app.services.s3_service.S3Service.upload_file") as mock_upload:
        for idx, title in enumerate(titles):
            mock_upload.return_value = f"test-key-sort-{idx}.txt"
            files = {"book_file": ("test.txt", b"Content", "text/plain")}
            data = {"title": title, "author": "Author"}
            client.post("/books/upload", files=files, data=data, headers=headers)

    response = client.get("/books/?sort_by=title&sort_order=asc", headers=headers)
    assert response.status_code == 200
    items = response.json()["items"]
    extracted_titles = [book["title"] for book in items if book["title"] in titles]
    assert extracted_titles == sorted(titles)

    response = client.get("/books/?sort_by=title&sort_order=desc", headers=headers)
    assert response.status_code == 200
    items = response.json()["items"]
    extracted_titles = [book["title"] for book in items if book["title"] in titles]
    assert extracted_titles == sorted(titles, reverse=True)

    response2 = client.get("/books/?sort_by=unknown&sort_order=asc", headers=headers)
    assert response2.status_code == 200