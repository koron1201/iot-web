from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base
from dotenv import load_dotenv
import os
import logging
from sqlalchemy import inspect
# webglを配信するためのStaticFilesクラスをmain.pyでインポート
from core.staticfiles import CompressedStaticFiles
from modules.research.router import router as research_router
from modules.news.router import router as news_router
from modules.calendar.router import router as calendar_router
from modules.contact.router import router as contact_router
from modules.submission.router import router as submission_router
from modules.chatbot.router import router as chatbot_router
# カレンダーぺージからの追加
from modules.auth.router import router as auth_router # 1. 【追加】 auth ルーター
from modules.auth import models as auth_models # 2. 【追加】 auth モデル
from modules.calendar import models as calendar_models
from modules.research import models as research_models
from modules.submission import models as submission_models
from modules.contact import models as contact_models

# uvicorn のロガーに出す（root が WARNING でも表示されやすい）
uvicorn_logger = logging.getLogger("uvicorn.error")

app = FastAPI()

load_dotenv()

Base.metadata.create_all(bind=engine)

# 起動時に「接続先」と「作成されたテーブル一覧」を確認（必要なときだけ）
if os.getenv("LOG_DB_INFO", "false").lower() == "true":
    try:
        inspector = inspect(engine)
        db_url_masked = engine.url.render_as_string(hide_password=True)
        tables_public = inspector.get_table_names(schema="public")
        uvicorn_logger.info("DB URL (password hidden): %s", db_url_masked)
        uvicorn_logger.info("DB tables (public): %s", tables_public)
    except Exception as e:
        uvicorn_logger.exception("DB inspection failed: %s", e)

cors_origins_raw = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173")
cors_origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#app.mount("/static", StaticFiles(directory="static/submisiions"), name="static_submisiions_images")
app.mount("/static/metaberse", CompressedStaticFiles(directory="static/metaberse"), name="static_metaberse")  
app.mount("/static/submissions", CompressedStaticFiles(directory="static/submissions"), name="static_submissions")

app.include_router(research_router)
app.include_router(news_router)
app.include_router(calendar_router)
app.include_router(contact_router)
app.include_router(submission_router)
app.include_router(chatbot_router)
# カレンダぺージからの追加
app.include_router(auth_router) # 4. 【追加】 auth ルーターを登録

@app.get('/')
def read_root():
    return {"message": "Backend is running with FastAPI!"}
