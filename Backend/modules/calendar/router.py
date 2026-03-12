from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.auth import get_db
from modules.calendar import crud, schemas
from core.auth import get_current_active_user, get_current_user_optional
from modules.auth.models import User as UserModel

router = APIRouter(
    prefix="/calendar",
    tags=["Calendar"],
)

@router.get("/", response_model=list[schemas.Schedule])
def get_all_schedules(
    db: Session = Depends(get_db),
    current_user: UserModel | None = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    schedules = crud.get_schedules_for_display(db=db, current_user_id=user_id)
    return schedules

@router.post("/", response_model=schemas.Schedule, status_code=status.HTTP_201_CREATED)
def create_new_schedule(
    schedule: schemas.ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    return crud.create_schedule(db=db, schedule=schedule, user_id=current_user.id)

@router.put("/{schedule_id}", response_model=schemas.Schedule)
def update_existing_schedule(
    schedule_id: int,
    schedule: schemas.ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    db_schedule = crud.get_schedule(db, schedule_id)
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    if db_schedule.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this schedule")

    return crud.update_schedule(db=db, schedule_id=schedule_id, schedule_data=schedule)

@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    db_schedule = crud.get_schedule(db, schedule_id)
    if not db_schedule:
        return

    if db_schedule.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this schedule")

    if crud.delete_schedule(db=db, schedule_id=schedule_id):
        return
    else:
        raise HTTPException(status_code=404, detail="Schedule not found after check")
