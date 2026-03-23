from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database import get_db
from models import User

SECRET_KEY = "CHANGE_THIS_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def hash_password(password: str):
    if not password:
        raise ValueError("Password required")

    password = str(password).strip()
    password = password[:72]   # 🔥 CRITICAL FIX

    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    plain_password = str(plain_password).strip()
    plain_password = plain_password[:72]   # 🔥 SAME FIX

    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = decode_token(token)
    user_id: int = payload.get("user_id")

    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid authentication")

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user

from datetime import datetime, timedelta
import uuid

REFRESH_TOKEN_EXPIRE_DAYS = 7

# store refresh tokens (simple version)
refresh_tokens_db = {}

def create_refresh_token(user_id: int):
    token = str(uuid.uuid4())
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    refresh_tokens_db[token] = {
        "user_id": user_id,
        "expires": expire
    }

    return token


def verify_refresh_token(token: str):
    data = refresh_tokens_db.get(token)

    if not data:
        return None

    if data["expires"] < datetime.utcnow():
        del refresh_tokens_db[token]
        return None

    return data["user_id"]