from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base
from modules.auth.models import User

# スケジュール（予定）のデータベースモデル
class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    start = Column(String)
    end = Column(String)
    allDay = Column(Boolean, default=False)
    color = Column(String, default="#3788d8")
    
    # DBに合わせて is_private に統一
    is_private = Column(Boolean, default=False)

    # 外部キー
    user_id = Column(Integer, ForeignKey("users.id", ondelete='CASCADE'))
    
    owner = relationship(User, back_populates="schedules")