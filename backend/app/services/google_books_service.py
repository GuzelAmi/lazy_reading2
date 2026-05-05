import requests
import time
from app.core.config import settings

class GoogleBooksService:
    def __init__(self):
        self.base_url = "https://www.googleapis.com/books/v1/volumes"
        self.api_key = settings.GOOGLE_BOOKS_API_KEY

    def search_books(self, query: str):
        params = {"q": query, "maxResults": 1}
        if self.api_key:
            params["key"] = self.api_key

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = requests.get(self.base_url, params=params, timeout=10)
                response.raise_for_status()
                return response.json()
            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1:  # последняя попытка
                    raise
                time.sleep(2 ** attempt)  # 1, 2, 4 секунды

    def get_cover_url(self, raw_data: dict) -> str | None:
        items = raw_data.get("items", [])
        if not items:
            return None
        volume_info = items[0].get("volumeInfo", {})
        image_links = volume_info.get("imageLinks", {})
        return image_links.get("thumbnail") or image_links.get("smallThumbnail")