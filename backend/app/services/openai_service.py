import httpx
from app.core.config import settings

class OpenAIService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = "https://api.openai.com/v1/chat/completions"
        # Для отслеживания расхода в рамках одной сессии
        self.total_tokens_used = 0
        self.total_requests = 0

    async def get_word_definition(self, word: str) -> dict:
        """
        Возвращает определение слова и статистику использования токенов
        """
        if not self.api_key:
            return {
                "definition": "API-ключ OpenAI не настроен",
                "tokens_used": 0,
                "total_tokens_used": self.total_tokens_used,
                "requests_count": self.total_requests
            }

        prompt = f"Дай точное определение слова '{word}' на русском языке одним-двумя предложениями. Пиши только определение, без лишних слов."

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "Ты словарь, который даёт определения слов."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 50,
            "temperature": 0.3
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(
                    self.base_url,
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                
                # Извлекаем определение
                definition = data["choices"][0]["message"]["content"].strip()
                
                # Извлекаем статистику использования токенов
                usage = data.get("usage", {})
                prompt_tokens = usage.get("prompt_tokens", 0)
                completion_tokens = usage.get("completion_tokens", 0)
                total_tokens = usage.get("total_tokens", 0)
                
                # Обновляем общую статистику
                self.total_tokens_used += total_tokens
                self.total_requests += 1
                
                # Выводим в консоль
                print("\n" + "="*50)
                print(f"📖 СЛОВО: {word}")
                print(f"📝 ОПРЕДЕЛЕНИЕ: {definition}")
                print("-"*50)
                print(f"📊 СТАТИСТИКА ЗАПРОСА:")
                print(f"   Токенов в запросе (prompt): {prompt_tokens}")
                print(f"   Токенов в ответе (completion): {completion_tokens}")
                print(f"   Всего токенов за запрос: {total_tokens}")
                print(f"   Всего запросов за сессию: {self.total_requests}")
                print(f"   Всего токенов за сессию: {self.total_tokens_used}")
                print("="*50 + "\n")
                
                return {
                    "definition": definition,
                    "tokens_used": total_tokens,
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens_used": self.total_tokens_used,
                    "requests_count": self.total_requests,
                    "success": True
                }
                
            except httpx.TimeoutException:
                error_msg = "Превышено время ожидания ответа от ChatGPT"
                print(f"❌ ОШИБКА: {error_msg}")
                return {
                    "definition": error_msg,
                    "tokens_used": 0,
                    "success": False,
                    "error": "timeout"
                }
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 401:
                    error_msg = "Неверный API-ключ OpenAI"
                elif e.response.status_code == 429:
                    error_msg = "Превышен лимит запросов к OpenAI"
                else:
                    error_msg = f"Ошибка ChatGPT: {e.response.status_code}"
                print(f"❌ ОШИБКА: {error_msg}")
                return {
                    "definition": error_msg,
                    "tokens_used": 0,
                    "success": False,
                    "error": "http_error",
                    "status_code": e.response.status_code
                }
            except Exception as e:
                error_msg = f"Неизвестная ошибка: {str(e)}"
                print(f"❌ ОШИБКА: {error_msg}")
                return {
                    "definition": error_msg,
                    "tokens_used": 0,
                    "success": False,
                    "error": "unknown"
                }
    
    def get_stats(self) -> dict:
        """Возвращает текущую статистику использования"""
        return {
            "total_requests": self.total_requests,
            "total_tokens_used": self.total_tokens_used
        }