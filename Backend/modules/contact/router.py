from fastapi import APIRouter

router = APIRouter(
    prefix="/contact",
    tags=["contact"],
    responses={404: {"description": "Not found"}},
)