from sqlalchemy import Column, Integer, String, LargeBinary, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.sql import func
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
  
    role = Column(String, default='user', nullable=False)
   

    books = relationship("Book", back_populates="owner")

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    author = Column(String, index=True, nullable=True)
    content = Column(LargeBinary, nullable=False)              # временно оставляем
    file_key = Column(String, unique=True, nullable=True)  # ключ в S3
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    total_sentences = Column(Integer, default=0)
    cover_url = Column(String, nullable=True)      
    owner = relationship("User", back_populates="books")

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    book_id = Column(Integer, ForeignKey("books.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    current_position = Column(Integer, default=0)

class Highlight(Base):
    __tablename__ = "highlights"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    sentence_index = Column(Integer)
    text = Column(Text)

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User", backref="refresh_tokens")


class Summary(Base):
    __tablename__ = "summaries"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    content = Column(Text)