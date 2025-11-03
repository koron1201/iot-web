from fastapi import APIRouter

router = APIRouter()

@router.get("/news")
async def read_news():
    return {"message": "News router is working!"}
