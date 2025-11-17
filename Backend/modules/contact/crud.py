from sqlalchemy.orm import Session
from . import models, schemas
from .mail import send_contact_email

def get_contact(db: Session, contact_id: int):
    return db.query(models.Contact).filter(models.Contact.id == contact_id).first()

def get_contacts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Contact).offset(skip).limit(limit).all()

def create_contact(db: Session, contact: schemas.ContactCreate):
    db_contact = models.Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    
    # お問い合わせメールを送信
    try:
        send_contact_email(contact.mail, contact.detail)
    except Exception as e:
        print(f"メール送信に失敗しましたが、データベースには保存されました: {str(e)}")
    
    return db_contact

def update_contact(db: Session, contact_id: int, contact: schemas.ContactCreate):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if db_contact:
        update_data = contact.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_contact, key, value)
        db.commit()
        db.refresh(db_contact)
    return db_contact