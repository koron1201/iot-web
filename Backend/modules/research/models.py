from sqlalchemy import Column, Integer, String, Text
from core.database import Base

class Research(Base):
    __tablename__ = "research"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)