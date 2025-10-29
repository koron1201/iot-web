from fastapi import FastAPI
from modules.research import router as research_router
from modules.news import router as news_router
from modules.calendar import router as calendar_router
from modules.contact import router as contact_router
from modules.deliverables import router as deliverables_router
from modules.chatbot import router as chatbot_router

app = FastAPI()

app.include_router(research_router.router)
app.include_router(news_router.router)
app.include_router(calendar_router.router)
app.include_router(contact_router.router)
app.include_router(deliverables_router.router)
app.include_router(chatbot_router.router)

@app.get('/')
def read_root():
    return {"message": "Backend is running with FastAPI!"}
