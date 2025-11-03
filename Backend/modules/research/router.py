from fastapi import APIRouter

router = APIRouter()

@router.get("/research")
async def read_research():
    return {"message": "Research router is working!"}
