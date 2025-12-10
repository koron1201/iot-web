from pydantic import BaseModel

# フロント → バック
class ResearchCreate(BaseModel):
    name: str
    title: str
    description: str

# バック → フロント
class ResearchResponse(BaseModel):
    id: int
    name: str
    title: str
    description: str | None = None

    class Config:
        orm_mode = True