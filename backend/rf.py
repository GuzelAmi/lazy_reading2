from app.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    conn.execute(text("ALTER TABLE books ADD COLUMN IF NOT EXISTS file_key VARCHAR(255) UNIQUE"))
    conn.execute(text("ALTER TABLE books ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
    conn.execute(text("ALTER TABLE books ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP"))
    conn.execute(text("ALTER TABLE books ADD COLUMN IF NOT EXISTS total_sentences INTEGER DEFAULT 0"))
    conn.commit()
    print("Колонки добавлены")