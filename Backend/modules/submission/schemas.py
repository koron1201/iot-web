from pydantic import BaseModel
from typing import Optional

class SubmissionBase(BaseModel):
    title: str
    subtitle: str
    description: Optional[str] = None

class SubmissionCreate(SubmissionBase):
    pass

class Submission(SubmissionBase):
    id: int
    file_path: Optional[str] = None
    thumbnail_path: Optional[str] = None

    class Config:
        from_attributes = True
