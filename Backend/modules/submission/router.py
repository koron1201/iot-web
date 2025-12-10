#OSをインポートしてファイル操作で使う
import os
#ファイルの保存・削除で使う
import shutil
# zipファイルを読み書きするのに使う
import zipfile
# 型ヒントでLIST型を読み込むのに使う
from typing import List

'''
FastAPI から必要な機能をまとめてインポート。

APIRouter: /submission のようなエンドポイント群を分けて定義するためのルーター。

Depends: 依存性注入（DB セッションを関数に自動で渡す）に使う。

File: ファイルアップロード用のパラメータ宣言。

Form: フォームデータを受け取るパラメータ宣言。

HTTPException: エラー時に HTTP ステータスコード付きで例外を投げるためのクラス。

UploadFile: アップロードされたファイルを表す型（ストリームで扱える）。
'''
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
# DBにクエリを投げたり、レコードを追加・削除に使う
from sqlalchemy.orm import Session

# DB接続付きのsessionインスタンスを生成
from core.database import SessionLocal
# DB操作、データテーブルの定義、通信用データ型
from . import crud, models, schemas

# APIルーターのインスタンス
router = APIRouter(
    # /submissionから始まるURLになる
    prefix="/submission",
    # ドキュメント上で、submissionタグでグループ化
    tags=["submission"],
    # 404のレスポンス文
    responses={404: {"description": "見つかりません"}},
)

# DB セッションの取得
def get_db():
    # 新しいDBセッション
    db = SessionLocal()
    try:
        # 指定したDBURLをエンドポイントに指定する
        yield db
    finally:
        # 処理が終わった後、DBの接続を停止
        db.close()

#フォームデータを受け取るAPI
# /submission/に対して呼ばれるようにする
# レスポンスの型を指定する
@router.post("/", response_model=schemas.Submission)
# フォームから送られてきたデータを受け取る
def create_submission(
    db: Session = Depends(get_db),
    title: str = Form(...),
    subtitle: str = Form(...),
    description: str = Form(...), 
    file: UploadFile = File(""), #空でOK
    thumbnail_file: UploadFile = File("") #空でOK
):
    # 1. 最初にデータベースに提出エントリを作成し、IDを取得
    # フォームデータから送信データを作成
    submission_create = schemas.SubmissionCreate(title=title, subtitle=subtitle, description=description)
    # 作成した送信データをDBに送信して、レコードを作成する
    db_submission = crud.create_submission(db=db, submission=submission_create)

    # 2. 提出物用のディレクトリを作成
    # DBにレコードを作成した際のidでパスを作成
    upload_dir = os.path.join("static/submissions", str(db_submission.id))
    # 作成したURLが存在しなければフォルダを作成（存在していてもエラーにならない)
    os.makedirs(upload_dir, exist_ok=True)

    # 3. ファイルタイプを検証
    # ファイル名を小文字にして.zipか確認
    if not file.filename.lower().endswith('.zip'):
        # .zip以外ならDBレコードを削除する
        crud.delete_submission(db=db, submission_id=db_submission.id)
        # .zip以外なら作成したフォルダを削除
        shutil.rmtree(upload_dir)
        # .zip以外の時のエラー文
        raise HTTPException(status_code=400, detail="無効なファイルタイプです。zipファイルをアップロードしてください。")
    # /images/pngか画像のcontent-typeをチェック
    if not thumbnail_file.content_type.startswith("image/"):
        # 以下、上の条件文と同じような処理
        crud.delete_submission(db=db, submission_id=db_submission.id)
        shutil.rmtree(upload_dir)
        raise HTTPException(status_code=400, detail="無効なサムネイルファイルタイプです。画像ファイルをアップロードしてください。")
    
    # アップロードされたzipファイルを一次的に保存するパスを作成
    temp_zip_path = os.path.join(upload_dir, file.filename)
    # サムネイル画像を保存するパスを作成
    thumbnail_path = os.path.join(upload_dir, thumbnail_file.filename)
    # .zipファイルを展開後に見つけた、index.htmlのパスを格納する変数
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

# 全提出物一覧取得
@router.get("/", response_model=List[schemas.Submission])
def read_submissions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    submissions = crud.get_submissions(db, skip=skip, limit=limit)
    return submissions

# 特定のIDの提出物取得
@router.get("/{submission_id}", response_model=schemas.Submission)
def read_submission(submission_id: int, db: Session = Depends(get_db)):
    db_submission = crud.get_submission(db, submission_id=submission_id)
    if db_submission is None:
        raise HTTPException(status_code=404, detail="提出物が見つかりません")
    return db_submission

# 提出物の削除
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
