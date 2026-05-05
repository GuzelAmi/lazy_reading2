# app/main.py
from fastapi import FastAPI, Depends, HTTPException, status, Form, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
import chardet
from app.services.google_books_service import GoogleBooksService
import asyncio
from app import auth, crud, models, schemas
from app.database import get_db, engine
from app.ollama_dictionary import OllamaDictionary
from app.utils import split_into_sentences
from app.services.s3_service import S3Service
from fastapi.responses import PlainTextResponse
from app.services.openai_service import OpenAIService

# создаём таблицы (если их нет)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Book Reader API", version="1.0.0")
openai_service = OpenAIService()
# CORS (для разработки)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
# ollama_dict = OllamaDictionary()


# ------------------------------------------------------------
# Аутентификация 
# ------------------------------------------------------------

@app.post("/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(400, "Username already registered")
    return crud.create_user(db, user.username, user.password)


@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(401, "Incorrect username or password")
    access_token = auth.create_access_token(data={"sub": user.username})
    refresh_token = auth.create_refresh_token(db, user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role
    }


@app.post("/auth/refresh")
def refresh_token(request: schemas.TokenRefreshRequest, db: Session = Depends(get_db)):
    user = auth.verify_refresh_token(db, request.refresh_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    auth.revoke_refresh_token(db, request.refresh_token)
    new_access_token = auth.create_access_token(data={"sub": user.username})
    new_refresh_token = auth.create_refresh_token(db, user.id)
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@app.post("/auth/logout")
def logout(request: schemas.TokenRefreshRequest, db: Session = Depends(get_db)):
    auth.revoke_refresh_token(db, request.refresh_token)
    return {"message": "Logged out successfully"}


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = auth.decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(401, "Invalid token")
    user = crud.get_user_by_username(db, payload["sub"])
    if not user:
        raise HTTPException(401, "User not found")
    return user


def get_current_admin_user(current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(403, "Not enough permissions")
    return current_user

@app.get("/auth/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ------------------------------------------------------------
# Книги (Лабораторная)
# ------------------------------------------------------------
@app.get("/books/", response_model=dict)
def get_books(
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = 1,
    size: int = 10,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # ВЫЗОВ ФУНКЦИИ ИЗ CRUD
    items, total = crud.get_books_filtered(db, current_user.id, search, sort_by, sort_order, page, size)
    
    # Преобразуем SQLAlchemy-объекты в Pydantic
    items_out = [schemas.BookOut.model_validate(book) for book in items]
    
    return {
        "items": items_out,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }

@app.put("/books/{book_id}", response_model=schemas.BookOut)
def update_book(
    book_id: int,
    book_data: schemas.BookUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    book = crud.get_book(db, book_id)
    if not book or book.owner_id != current_user.id:
        raise HTTPException(403, "Access denied")
    updated = crud.update_book(db, book_id, book_data.title, book_data.author)
    return updated


@app.delete("/books/{book_id}")
def delete_book(
    book_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    s3: S3Service = Depends(lambda: S3Service())
):
    book = crud.get_book(db, book_id)
    if not book or book.owner_id != current_user.id:
        raise HTTPException(403, "Access denied")
    # удаляем файл из S3 (если он там есть)
    if book.file_key:
        s3.delete_file(book.file_key)
    # удаляем запись из БД
    crud.delete_book(db, book_id)
    return {"message": "Book deleted"}


@app.post("/books/upload", response_model=schemas.BookOut)
def upload_book(
    book_file: UploadFile = File(...),
    title: str = Form(...),
    author: str | None = Form(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    s3: S3Service = Depends(lambda: S3Service())
):
    # 1. Валидация файла
    if not book_file.filename.endswith('.txt'):
        raise HTTPException(400, "Only TXT files allowed")
    content = book_file.file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large (max 10 MB)")

    # 2. Загрузка в MinIO
    file_key = s3.upload_file(content, book_file.filename)

    # 3. Сохранение книги в БД (без обложки)
    book = crud.create_book(db, title, author, content, file_key, current_user.id)

    # 4. Синхронное получение обложки из Google Books
    try:
        from app.services.google_books_service import GoogleBooksService
        service = GoogleBooksService()
        query = f"{title} {author}" if author else title
        data = service.search_books(query)
        cover = service.get_cover_url(data)
        if cover:
            book.cover_url = cover
            db.commit()
            print(f"Cover added for book {book.id}")
        else:
            print(f"No cover found for book {book.id}")
    except Exception as e:
        print(f"Error fetching cover: {e}")
        # Не прерываем загрузку, если обложка не подтянулась

    return book


@app.get("/books/{book_id}/text")
def get_book_text(
    book_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    book = crud.get_book(db, book_id)
    if not book or book.owner_id != current_user.id:
        raise HTTPException(403, "Access denied")
    # текст всё ещё хранится в БД (поле content) – для обратной совместимости
    detected = chardet.detect(book.content)
    encoding = detected['encoding'] if detected['confidence'] > 0.7 else 'utf-8'
    try:
        text = book.content.decode(encoding)
    except:
        text = book.content.decode('utf-8', errors='replace')
    return text


@app.get("/books/{book_id}/download")
def download_book(
    book_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    s3: S3Service = Depends(lambda: S3Service())
):
    book = crud.get_book(db, book_id)
    if not book or book.owner_id != current_user.id:
        raise HTTPException(403, "Access denied")
    if not book.file_key:
        raise HTTPException(404, "File not found in storage")
    url = s3.generate_presigned_url(book.file_key)
    return {"url": url}


# ------------------------------------------------------------
# Сессии
# ------------------------------------------------------------
@app.post("/sessions/", response_model=schemas.SessionOut)
def create_session(
    session: schemas.SessionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    book = crud.get_book(db, session.book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    if book.owner_id != current_user.id:
        raise HTTPException(403, "Access denied")
    return crud.create_session(db, session.name, session.book_id, current_user.id)

@app.get("/sessions/")
def get_user_sessions(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(models.Session).filter(models.Session.user_id == current_user.id).all()
    result = []
    for s in sessions:
        book = db.query(models.Book).filter(models.Book.id == s.book_id).first()
        total_sentences = 0
        if book:
            sentences = split_into_sentences(book.content)
            total_sentences = len(sentences)
        result.append({
            "id": s.id,
            "name": s.name,
            "book_id": s.book_id,
            "user_id": s.user_id,
            "current_position": s.current_position,
            "total_sentences": total_sentences,
            "book_title": book.title if book else "Неизвестная книга",
            "book_author": book.author if book else None,
            "book_cover_url": book.cover_url if book else None  
        })
    return result


@app.get("/sessions/{session_id}")
def get_session(
    session_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(404, "Session not found")
    book = crud.get_book(db, session.book_id)
    total_sentences = 0
    if book:
        total_sentences = len(split_into_sentences(book.content))
    return {
        "id": session.id,
        "name": session.name,
        "book_id": session.book_id,
        "user_id": session.user_id,
        "current_position": session.current_position,
        "total_sentences": total_sentences
    }


@app.put("/sessions/{session_id}/position")
def update_position(
    session_id: int,
    position: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(403, "Access denied")
    session.current_position = position
    db.commit()
    return {"success": True}


@app.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    s3: S3Service = Depends(lambda: S3Service())
):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session not found")
    if current_user.role != 'admin' and session.user_id != current_user.id:
        raise HTTPException(403, "Access denied")
    
    # Находим книгу
    book = crud.get_book(db, session.book_id)
    if book:
        # Удаляем книгу (каскадно удалит все сессии, выделения и т.д.)
        crud.delete_book(db, book.id)
        # Удаляем файл из S3
        if book.file_key:
            s3.delete_file(book.file_key)
    else:
        # Если книги нет, удаляем только сессию
        db.query(models.Highlight).filter(models.Highlight.session_id == session_id).delete()
        db.delete(session)
        db.commit()
    
    return {"message": "Session and associated book deleted"}
# ------------------------------------------------------------
# Выделения
# ------------------------------------------------------------
@app.post("/sessions/{session_id}/highlights")
def add_highlight(
    session_id: int,
    highlight: schemas.HighlightCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(403, "Access denied")
    db_highlight = models.Highlight(
        session_id=session_id,
        sentence_index=highlight.sentence_index,
        text=highlight.text
    )
    db.add(db_highlight)
    db.commit()
    db.refresh(db_highlight)
    return {"id": db_highlight.id}


@app.get("/sessions/{session_id}/highlights")
def get_highlights(
    session_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(403, "Access denied")
    return db.query(models.Highlight).filter(models.Highlight.session_id == session_id).all()


# ------------------------------------------------------------
# Словарь
# ------------------------------------------------------------
@app.get("/api/dictionary/{word}", response_model=schemas.DictionaryResponse)
async def get_word_definition(word: str, current_user: models.User = Depends(get_current_user)):
    """
    Получает определение слова через ChatGPT с логированием токенов
    """
    result = await openai_service.get_word_definition(word)
    
    # Извлекаем определение (результат может быть строкой или словарём)
    if isinstance(result, dict):
        definition = result.get("definition", "Не удалось получить определение")
    else:
        definition = result
    
    return {
        "word": word,
        "definition": definition,
        "example": "",
        "source": "chatgpt"
    }


# ------------------------------------------------------------
# Административные эндпоинты
# ------------------------------------------------------------
@app.get("/admin/users", response_model=list[schemas.UserOut])
def get_all_users(
    current_user: models.User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    return db.query(models.User).all()


@app.put("/admin/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    current_user: models.User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    if role not in ['user', 'admin']:
        raise HTTPException(400, "Invalid role")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.id == current_user.id:
        raise HTTPException(400, "Cannot change your own role")
    user.role = role
    db.commit()
    return {"message": f"User {user.username} role updated to {role}"}


@app.delete("/admin/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: models.User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.id == current_user.id:
        raise HTTPException(400, "Cannot delete yourself")
    # удаляем все книги пользователя и связанные сессии
    books = db.query(models.Book).filter(models.Book.owner_id == user_id).all()
    for book in books:
        sessions = db.query(models.Session).filter(models.Session.book_id == book.id).all()
        for sess in sessions:
            db.query(models.Highlight).filter(models.Highlight.session_id == sess.id).delete()
            db.delete(sess)
        db.delete(book)
    # удаляем оставшиеся сессии (без книг)
    sessions = db.query(models.Session).filter(models.Session.user_id == user_id).all()
    for sess in sessions:
        db.query(models.Highlight).filter(models.Highlight.session_id == sess.id).delete()
        db.query(models.Summary).filter(models.Summary.session_id == sess.id).delete()
        db.delete(sess)
    db.delete(user)
    db.commit()
    return {"message": f"User {user.username} deleted"}


@app.get("/sitemap.xml", response_class=PlainTextResponse)
async def sitemap():
    base_url = "https://lazyreading.ru" 
    urls = [
        f"<url><loc>{base_url}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>",
    ]
    sitemap_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""
    return sitemap_xml

@app.get("/robots.txt", response_class=PlainTextResponse)
async def robots():
    return """User-agent: *
Allow: /$
Disallow: /books$
Disallow: /auth/
Disallow: /admin/
Disallow: /sessions/
Disallow: /api/dictionary/
Sitemap: https://lazyreading.ru/sitemap.xml
"""