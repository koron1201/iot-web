from sqlalchemy.orm import Session
from . import models, schemas

def get_submission(db: Session, submission_id: int):
    return db.query(models.Submission).filter(models.Submission.id == submission_id).first()

def get_submissions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Submission).offset(skip).limit(limit).all()

def create_submission(db: Session, submission: schemas.SubmissionCreate):
    db_submission = models.Submission(**submission.model_dump())
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission

def update_submission_paths(db: Session, submission_id: int, file_path: str, thumbnail_path: str):
    db_submission = get_submission(db, submission_id)
    if db_submission:
        db_submission.file_path = file_path
        db_submission.thumbnail_path = thumbnail_path
        db.commit()
        db.refresh(db_submission)
    return db_submission

def delete_submission(db: Session, submission_id: int):
    db_submission = get_submission(db, submission_id)
    if db_submission:
        db.delete(db_submission)
        db.commit()
    return db_submission
