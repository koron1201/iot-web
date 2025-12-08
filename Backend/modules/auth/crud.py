from sqlalchemy.orm import Session
from . import models, schemas
from core.auth import get_password_hash # ハッシュ化関数をインポート

def get_user_by_username(db: Session, username: str):
    """ユーザー名でユーザーを検索"""
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    """新しいユーザーを作成（パスワードはハッシュ化して保存）"""
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user