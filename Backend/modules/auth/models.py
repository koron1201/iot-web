from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship # relationshipをインポート
from core.database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    schedules = relationship("Schedule", back_populates="owner")