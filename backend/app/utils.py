import re
import chardet

def split_into_sentences(text: bytes) -> list[str]:
    """Декодирует текст и разбивает на предложения."""
    detected = chardet.detect(text)
    encoding = detected['encoding'] if detected['confidence'] > 0.7 else 'utf-8'
    try:
        decoded = text.decode(encoding)
    except:
        decoded = text.decode('utf-8', errors='replace')
    # Удаляем html теги
    cleaned = re.sub(r'<[^>]*>', '', decoded)
    # Разбиваем по знакам препинания
    sentences = re.split(r'[.!?]+', cleaned)
    # Фильтруем пустые и короткие
    return [s.strip() for s in sentences if len(s.strip()) > 3]