from pydantic import BaseModel, Field

class ScheduleBase(BaseModel):
    title: str = Field(..., max_length=100, description="予定のタイトル")
    start: str = Field(..., description="開始日時")
    end: str = Field(..., description="終了日時")
    allDay: bool = Field(False, description="終日フラグ")
    color: str | None = Field("#3788d8", description="予定の色")
    
    # ★ 修正: is_private に統一
    is_private: bool = Field(False, description="非公開フラグ")

class ScheduleCreate(ScheduleBase):
    pass

class Schedule(ScheduleBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True