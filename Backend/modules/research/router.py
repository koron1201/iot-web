from fastapi import APIRouter

router = APIRouter(
    prefix="/research",
    tags=["research"],
    responses={404: {"description": "Not found"}},
)