from fastapi import FastAPI
from modules.research.router import router as research_router
from modules.news.router import router as news_router
from modules.calendar.router import router as calendar_router
from modules.contact.router import router as contact_router
from modules.submission.router import router as submission_router
from modules.chatbot.router import router as chatbot_router

app = FastAPI()

app.include_router(research_router)
app.include_router(news_router)
app.include_router(calendar_router)
app.include_router(contact_router)
app.include_router(submission_router)
app.include_router(chatbot_router)

@app.get('/')
def read_root():
    return {"message": "Backend is running with FastAPI!"}
