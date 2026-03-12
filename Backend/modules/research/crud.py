from sqlalchemy.orm import Session
from . import models, schemas

def create_research(db: Session, data: schemas.ResearchCreate):
    new_item = models.Research(
        name=data.name,
        title=data.title,
        description=data.description,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

def delete_research(db: Session, research_id: int):
    db_research = db.query(models.Research).filter(models.Research.id == research_id).first()

    if db_research is None:
        return None

    db.delete(db_research)
    db.commit()
    return True

def get_research_list(db: Session):
    return db.query(models.Research).all()
