import os
import shutil
import zipfile
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from core.database import SessionLocal
from . import crud, models, schemas

router = APIRouter(
    prefix="/submission",
    tags=["submission"],
    responses={404: {"description": "見つかりません"}},
)

# DB セッションの取得
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#フォームデータを受け取るAPI
@router.post("/", response_model=schemas.Submission)
def create_submission(
    db: Session = Depends(get_db),
    title: str = Form(...),
    subtitle: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    thumbnail_file: UploadFile = File(...)
):
    # 1. 最初にデータベースに提出エントリを作成し、IDを取得
    submission_create = schemas.SubmissionCreate(title=title, subtitle=subtitle, description=description)
    db_submission = crud.create_submission(db=db, submission=submission_create)

    # 2. 提出物用のディレクトリを作成
    upload_dir = os.path.join("static/submissions", str(db_submission.id))
    os.makedirs(upload_dir, exist_ok=True)

    # 3. ファイルタイプを検証
    if not file.filename.lower().endswith('.zip'):
        crud.delete_submission(db=db, submission_id=db_submission.id)
        shutil.rmtree(upload_dir)
        raise HTTPException(status_code=400, detail="無効なファイルタイプです。zipファイルをアップロードしてください。")
    if not thumbnail_file.content_type.startswith("image/"):
        crud.delete_submission(db=db, submission_id=db_submission.id)
        shutil.rmtree(upload_dir)
        raise HTTPException(status_code=400, detail="無効なサムネイルファイルタイプです。画像ファイルをアップロードしてください。")

    temp_zip_path = os.path.join(upload_dir, file.filename)
    thumbnail_path = os.path.join(upload_dir, thumbnail_file.filename)
    final_file_path = None

    try:
        # サムネイルファイルを保存
        with open(thumbnail_path, "wb") as buffer:
            shutil.copyfileobj(thumbnail_file.file, buffer)
            
        # アップロードされたzipファイルを一時的に保存
        with open(temp_zip_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # zipファイルを展開
        with zipfile.ZipFile(temp_zip_path, 'r') as zip_ref:
            zip_ref.extractall(upload_dir)

    except Exception as e:
        # ファイルの保存または展開が失敗した場合、ロールバックしてクリーンアップ
        crud.delete_submission(db=db, submission_id=db_submission.id)
        shutil.rmtree(upload_dir)
        raise HTTPException(status_code=500, detail=f"ファイルの保存または展開に失敗しました: {e}")
    finally:
        # 一時的なzipファイルをクリーンアップ
        if os.path.exists(temp_zip_path):
            os.remove(temp_zip_path)
        file.file.close()
        thumbnail_file.file.close()

    # 4. 作成された index.html のパスを検索
    for root, dirs, files in os.walk(upload_dir):
        if "index.html" in files:
            final_file_path = os.path.join(root, "index.html")
            break
            
    if not final_file_path:
        # 展開後に index.html が見つからない場合、ロールバックしてクリーンアップ
        crud.delete_submission(db=db, submission_id=db_submission.id)
        shutil.rmtree(upload_dir)
        raise HTTPException(status_code=400, detail="zipファイル内にindex.htmlが見つかりません。")

    # 5. データベースエントリを正しい、URL互換のパスで更新
    url_compatible_path = final_file_path.replace(os.sep, '/')
    thumbnail_url_path = thumbnail_path.replace(os.sep, '/')
    updated_submission = crud.update_submission_paths(db=db, submission_id=db_submission.id, file_path=url_compatible_path, thumbnail_path=thumbnail_url_path)
    
    return updated_submission

@router.get("/", response_model=List[schemas.Submission])
def read_submissions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    submissions = crud.get_submissions(db, skip=skip, limit=limit)
    return submissions

@router.get("/{submission_id}", response_model=schemas.Submission)
def read_submission(submission_id: int, db: Session = Depends(get_db)):
    db_submission = crud.get_submission(db, submission_id=submission_id)
    if db_submission is None:
        raise HTTPException(status_code=404, detail="提出物が見つかりません")
    return db_submission

@router.delete("/{submission_id}", response_model=schemas.Submission)
def delete_submission(submission_id: int, db: Session = Depends(get_db)):
    db_submission = crud.get_submission(db, submission_id=submission_id)
    if db_submission is None:
        raise HTTPException(status_code=404, detail="提出物が見つかりません")

    # 関連ファイル/ディレクトリを削除
    upload_dir = os.path.join("static/submissions", str(submission_id))
    if os.path.exists(upload_dir):
        shutil.rmtree(upload_dir)

    # DBから削除
    deleted_submission = crud.delete_submission(db, submission_id=submission_id)
    return deleted_submission
