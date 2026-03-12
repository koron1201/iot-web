from pydantic import BaseModel, Field  # <- Field がインポートされている

class UserCreate(BaseModel):
    username: str
    # max_length=72 が設定されている
    password: str = Field(..., min_length=8, max_length=72)

# ユーザー情報を返すときの基本データ
class User(BaseModel):
    id: int
    username: str
    is_active: bool

    class Config:
        from_attributes = True

# ログイン成功時に返すトークン
class Token(BaseModel):
    access_token: str
    token_type: str

# トークン内部に保持するデータ
class TokenData(BaseModel):
    username: str | None = None