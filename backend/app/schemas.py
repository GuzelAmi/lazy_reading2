# app/schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime 
class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
   
    role: str
   

    class Config:
        from_attributes = True

class BookOut(BaseModel):
    id: int
    title: str
    author: Optional[str] = None
    file_key: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    cover_url: Optional[str] = None
    class Config:
        from_attributes = True

class SessionOut(BaseModel):
    id: int
    name: str
    book_id: int
    user_id: int
    current_position: int = 0

    class Config:
        from_attributes = True

class SessionCreate(BaseModel):
    name: str
    book_id: int

class HighlightCreate(BaseModel):
    sentence_index: int
    text: str

class HighlightOut(BaseModel):
    id: int
    session_id: int
    sentence_index: int
    text: str

    class Config:
        from_attributes = True

class DictionaryResponse(BaseModel):
    word: str
    definition: str
    example: str
    source: str


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class BookUpdate(BaseModel):
    title: str
    author: Optional[str] = None

class BookFilterParams(BaseModel):
    search: Optional[str] = None
    sort_by: str = "created_at"
    sort_order: str = "desc"
    page: int = 1
    size: int = 10