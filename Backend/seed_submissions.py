import os
import sys
from sqlalchemy.orm import Session

# パスを通す
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal, engine, Base
from modules.submission.models import Submission

def seed_submissions():
    # テーブル作成（念のため）
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    static_dir = os.path.join("static", "submissions")
    
    if not os.path.exists(static_dir):
        print(f"Directory not found: {static_dir}")
        return

    print(f"Scanning {static_dir}...")
    
    # 既存のIDセットを取得
    existing_ids = {s.id for s in db.query(Submission).all()}
    
    for item in os.listdir(static_dir):
        item_path = os.path.join(static_dir, item)
        if os.path.isdir(item_path):
            try:
                submission_id = int(item)
            except ValueError:
                continue

            if submission_id in existing_ids:
                print(f"Submission {submission_id} already exists. Skipping.")
                continue

            # Find index.html and thumbnail
            index_path = None
            thumbnail_path = None
            
            # ディレクトリ内を探索
            for root, dirs, files in os.walk(item_path):
                if "index.html" in files:
                    # 相対パスを取得してURL形式に変換
                    # os.path.relpath は実行ディレクトリからの相対パスになるので注意
                    # ここでは静的ファイルとして保存すべきパス（static/...）を取得する
                    full_path = os.path.join(root, "index.html")
                    rel_path = os.path.relpath(full_path, os.getcwd())
                    index_path = rel_path.replace("\\", "/")
                
                for f in files:
                    if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')) and not thumbnail_path:
                        full_thumb_path = os.path.join(root, f)
                        rel_thumb = os.path.relpath(full_thumb_path, os.getcwd())
                        thumbnail_path = rel_thumb.replace("\\", "/")

            if index_path:
                print(f"Adding Submission {submission_id}...")
                print(f"  File: {index_path}")
                print(f"  Thumb: {thumbnail_path}")
                
                submission = Submission(
                    id=submission_id,
                    title=f"Project {submission_id}",
                    subtitle="ARCHIVE DATA",
                    description="復元されたアーカイブデータです。",
                    file_path=index_path,
                    thumbnail_path=thumbnail_path
                )
                db.add(submission)
            else:
                print(f"Skipping {submission_id}: index.html not found.")

    db.commit()
    db.close()
    print("Database seed completed.")

if __name__ == "__main__":
    seed_submissions()

