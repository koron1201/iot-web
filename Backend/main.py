from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base
from dotenv import load_dotenv
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

app = FastAPI()

load_dotenv()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
