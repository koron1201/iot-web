from fastapi import APIRouter

router = APIRouter(
    prefix="/deliverables",
    tags=["deliverables"],
    responses={404: {"description": "Not found"}},
)