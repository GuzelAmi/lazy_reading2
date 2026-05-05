from unittest.mock import patch, AsyncMock
import pytest
pytestmark = pytest.mark.integration

def test_dictionary_requires_auth(client):
    """Эндпоинт словаря должен требовать авторизацию"""
    response = client.get("/api/dictionary/test")
    assert response.status_code == 401

def test_dictionary_success(client):
    """Успешное получение определения через ChatGPT"""
    # Регистрация и логин
    client.post("/auth/register", json={"username": "dictuser", "password": "pass"})
    login = client.post("/auth/login", data={"username": "dictuser", "password": "pass"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Мокаем OpenAIService
    with patch("app.services.openai_service.OpenAIService.get_word_definition") as mock:
        mock.return_value = {
            "definition": "Тестовое определение слова",
            "tokens_used": 50,
            "success": True
        }
        response = client.get("/api/dictionary/testword", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["definition"] == "Тестовое определение слова"
        assert data["source"] == "chatgpt"

def test_dictionary_api_error(client):
    """Обработка ошибки внешнего API"""
    client.post("/auth/register", json={"username": "dicterror", "password": "pass"})
    login = client.post("/auth/login", data={"username": "dicterror", "password": "pass"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    with patch("app.services.openai_service.OpenAIService.get_word_definition") as mock:
        mock.return_value = {
            "definition": "Превышено время ожидания ответа от ChatGPT",
            "success": False,
            "error": "timeout"
        }
        response = client.get("/api/dictionary/testword", headers=headers)
        assert response.status_code == 200  # Сервер возвращает 200 с сообщением об ошибке
        data = response.json()
        assert "Превышено время ожидания" in data["definition"]