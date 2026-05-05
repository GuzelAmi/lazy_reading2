import pytest
from app.crud import (
    create_user, get_user_by_username,
    create_book, get_book, update_book, delete_book,
    create_session
)
from app.auth import get_password_hash, verify_password
pytestmark = pytest.mark.unit
def test_create_user(db):
    user = create_user(db, "crudtest", "secret123")
    assert user.id is not None
    assert user.username == "crudtest"
    assert user.role == "user"
    assert verify_password("secret123", user.hashed_password)

def test_get_user_by_username(db):
    create_user(db, "findme", "pass")
    user = get_user_by_username(db, "findme")
    assert user is not None
    assert user.username == "findme"

def test_get_user_not_found(db):
    user = get_user_by_username(db, "nonexistent")
    assert user is None

def test_create_book(db):
    user = create_user(db, "bookowner", "pass")
    book = create_book(db, "Test Book", "Test Author", b"content", "key123", user.id)
    assert book.id is not None
    assert book.title == "Test Book"
    assert book.author == "Test Author"
    assert book.file_key == "key123"

def test_get_book(db):
    user = create_user(db, "bookowner2", "pass")
    created = create_book(db, "Get Book", None, b"content", "key456", user.id)
    fetched = get_book(db, created.id)
    assert fetched is not None
    assert fetched.title == "Get Book"

def test_update_book(db):
    user = create_user(db, "updater", "pass")
    book = create_book(db, "Old Title", "Old Author", b"content", "key789", user.id)
    updated = update_book(db, book.id, "New Title", "New Author")
    assert updated.title == "New Title"
    assert updated.author == "New Author"

def test_delete_book(db):
    user = create_user(db, "deleter", "pass")
    book = create_book(db, "To Delete", None, b"content", "key999", user.id)
    delete_book(db, book.id)
    deleted = get_book(db, book.id)
    assert deleted is None

def test_create_session(db):
    user = create_user(db, "sessionuser", "pass")
    book = create_book(db, "Session Book", None, b"content", "key111", user.id)
    session = create_session(db, "Test Session", book.id, user.id)
    assert session.id is not None
    assert session.name == "Test Session"
    assert session.current_position == 0