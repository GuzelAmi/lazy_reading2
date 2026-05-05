from sqlalchemy.orm import Session
from app import models, auth
from sqlalchemy import or_, desc, asc

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, username: str, password: str):
    hashed_password = auth.get_password_hash(password)
    user = models.User(username=username, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_book(db: Session, title: str, author: str | None, content: bytes, file_key: str | None, owner_id: int):
    book = models.Book(
        title=title,
        author=author,
        content=content,
        file_key=file_key,
        owner_id=owner_id
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book

def get_book(db: Session, book_id: int):
    return db.query(models.Book).filter(models.Book.id == book_id).first()

def create_session(db: Session, name: str, book_id: int, user_id: int):
    session = models.Session(name=name, book_id=book_id, user_id=user_id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def update_book(db: Session, book_id: int, title: str, author: str | None):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if book:
        book.title = title
        book.author = author
        db.commit()
        db.refresh(book)
    return book

def delete_book(db: Session, book_id: int):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if book:
        # Находим все сессии этой книги
        sessions = db.query(models.Session).filter(models.Session.book_id == book_id).all()
        for session in sessions:
            # Удаляем выделения
            db.query(models.Highlight).filter(models.Highlight.session_id == session.id).delete()
            # Удаляем конспекты (если есть модель Summary)
            db.query(models.Summary).filter(models.Summary.session_id == session.id).delete()
            # Удаляем сессию
            db.delete(session)
        # Теперь можно удалить книгу
        db.delete(book)
        db.commit()
    return book

def get_books_filtered(db: Session, user_id: int, search: str = None, sort_by: str = "created_at", sort_order: str = "desc", page: int = 1, size: int = 10):
    from sqlalchemy import or_, desc, asc
    query = db.query(models.Book).filter(models.Book.owner_id == user_id)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Book.title.ilike(search_term),
                models.Book.author.ilike(search_term)
            )
        )
    sort_column = getattr(models.Book, sort_by, models.Book.created_at)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return items, total