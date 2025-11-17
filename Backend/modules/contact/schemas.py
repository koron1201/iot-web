from pydantic import BaseModel
from typing import Optional

# Contact Schemas
class ContactBase(BaseModel):
    mail: str
    detail: str

class ContactCreate(ContactBase):
    pass

class Contact(ContactBase):
    id: int

    class Config:
        from_attributes = True