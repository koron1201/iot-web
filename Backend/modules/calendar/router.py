from fastapi import APIRouter

router = APIRouter()

@router.get("/calendar")
async def read_calendar():
    return {"message": "Calendar router is working!"}
