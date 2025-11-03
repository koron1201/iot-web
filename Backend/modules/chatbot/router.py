from fastapi import APIRouter

router = APIRouter()

@router.get("/chatbot")
async def read_chatbot():
    return {"message": "Chatbot router is working!"}
