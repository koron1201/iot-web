from sqlalchemy import Column, Integer, String, Text
from core.database import Base

class Submission(Base):
    __tablename__ = "submission"
    __table_args__ = {'extend_existing': True} 

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    subtitle = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    file_path = Column(String(255), nullable=True)
    thumbnail_path = Column(String(255), nullable=True)
