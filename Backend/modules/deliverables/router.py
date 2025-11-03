from fastapi import APIRouter

router = APIRouter()

@router.get("/deliverables")
async def read_deliverables():
    return {"message": "Deliverables router is working!"}
