from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, models
import uuid
SECRET_KEY = "development-secret-key-change-in-production"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=24)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None

def get_current_user_from_token(token: str, db: Session):
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        return None
    username = payload["sub"]
    return crud.get_user_by_username(db, username)

# \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ЛАБОРАТОРНАЯ НОМЕР 1\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
def get_current_admin_user(current_user: models.User = Depends(lambda: None), db: Session = Depends(lambda: None)):
    """
    Зависимость, проверяющая, что текущий пользователь является администратором.
    Используется в защищённых эндпоинтах.
    """
    # Эта функция будет использоваться с Depends(get_current_user) в main.py
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

REFRESH_TOKEN_EXPIRE_DAYS = 7
def create_refresh_token(db: Session, user_id: int) -> str:
    token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    rt = models.RefreshToken(token=token, user_id=user_id, expires_at=expires_at)
    db.add(rt)
    db.commit()
    return token

def verify_refresh_token(db: Session, token: str):
    rt = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == token,
        models.RefreshToken.revoked_at.is_(None),
        models.RefreshToken.expires_at > datetime.utcnow()
    ).first()
    if not rt:
        return None
    return rt.user

def revoke_refresh_token(db: Session, token: str):
    rt = db.query(models.RefreshToken).filter(models.RefreshToken.token == token).first()
    if rt:
        rt.revoked_at = datetime.utcnow()
        db.commit()

