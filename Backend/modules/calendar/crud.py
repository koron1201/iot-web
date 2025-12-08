from sqlalchemy.orm import Session
from sqlalchemy import or_
from modules.calendar.models import Schedule
from modules.calendar.schemas import ScheduleCreate, ScheduleBase
from typing import List

# 予定の新規作成
def create_schedule(db: Session, schedule: ScheduleCreate, user_id: int) -> Schedule:
    db_schedule = Schedule(
        **schedule.model_dump(), 
        user_id=user_id
    )
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

# 予定の取得（フィルタリング）
def get_schedules_for_display(db: Session, current_user_id: int | None = None) -> List[Schedule]:
    query = db.query(Schedule)

    if current_user_id is None:
        # ★ 修正: is_private を使用
        return query.filter(Schedule.is_private == False).all()
    else:
        # ★ 修正: is_private を使用
        return query.filter(
            or_(
                Schedule.user_id == current_user_id,
                Schedule.is_private == False
            )
        ).all()

# その他の関数はそのまま利用可能
def get_schedule(db: Session, schedule_id: int) -> Schedule | None:
    return db.query(Schedule).filter(Schedule.id == schedule_id).first()

def update_schedule(db: Session, schedule_id: int, schedule_data: ScheduleBase) -> Schedule | None:
    db_schedule = get_schedule(db, schedule_id)
    if db_schedule:
        for key, value in schedule_data.model_dump().items():
            setattr(db_schedule, key, value)
        db.commit()
        db.refresh(db_schedule)
    return db_schedule

def delete_schedule(db: Session, schedule_id: int) -> bool:
    db_schedule = get_schedule(db, schedule_id)
    if db_schedule:
        db.delete(db_schedule)
        db.commit()
        return True
    return False