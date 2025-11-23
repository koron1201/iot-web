from sqlalchemy import Column, Integer, String, Text, Boolean
from core.database import Base

class Contact(Base):
    __tablename__ = "contact"
    __table_args__ = {'extend_existing': True} 

    id = Column(Integer, primary_key=True, index=True)
    mail = Column(String(255), index=True)
    detail = Column(Text, nullable=True)