import requests
import re

class OllamaDictionary:
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "mistral:latest"):
        self.base_url = base_url
        self.model = model

    def get_word_definition(self, word: str) -> dict:
        """Возвращает определение и пример использования слова."""
        clean_word = re.sub(r'[^\w\s-]', '', word).strip().lower()
        if len(clean_word) < 2:
            return {"word": clean_word, "definition": "Слово слишком короткое", "example": ""}

        prompt = f"""Объясни слово "{clean_word}" одной фразой и приведи пример.
Ответ в формате:
Определение: [краткое объяснение]
Пример: [пример предложения]"""

        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.2, "num_predict": 100}
                },
                timeout=30
            )
            if response.status_code == 200:
                result = response.json()["response"].strip()
                definition, example = "", ""
                for line in result.split('\n'):
                    if 'определение:' in line.lower():
                        definition = line.split(':', 1)[-1].strip()
                    elif 'пример:' in line.lower():
                        example = line.split(':', 1)[-1].strip()
                return {"word": clean_word, "definition": definition or result[:200], "example": example}
        except Exception as e:
            print(f"Ollama error: {e}")
        return {"word": clean_word, "definition": "Не удалось получить определение", "example": ""}