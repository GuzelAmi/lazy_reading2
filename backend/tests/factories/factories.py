import factory
from sqlalchemy.orm import Session
from app import models
from app.auth import get_password_hash  # исправлено

class UserFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = models.User
        sqlalchemy_session = None

    username = factory.Sequence(lambda n: f"user{n}")
    hashed_password = get_password_hash("testpass")
    role = "user"

class AdminFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = models.User
        sqlalchemy_session = None

    username = factory.Sequence(lambda n: f"admin{n}")
    hashed_password = get_password_hash("adminpass")
    role = "admin"

class BookFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = models.Book
        sqlalchemy_session = None

    title = factory.Faker("sentence", nb_words=3)
    author = factory.Faker("name")
    content = b"Test content of the book. This is a sentence. Another sentence."
    file_key = factory.Sequence(lambda n: f"key/{n}")
    cover_url = None
    owner_id = 1

class SessionFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = models.Session
        sqlalchemy_session = None

    name = "Test Session"
    book_id = 1
    user_id = 1
    current_position = 0