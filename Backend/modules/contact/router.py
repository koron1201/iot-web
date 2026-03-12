from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from core.database import SessionLocal
from . import crud, schemas
from .rate_limiter import rate_limiter
import logging

# ロガー設定
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/contact",
    tags=["contact"],
    responses={404: {"description": "Not found"}},
)

# DB セッション
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_client_ip(request: Request) -> str:
    """
    クライアントのIPアドレスを取得する
    プロキシやロードバランサーを考慮して実際のIPを取得
    """
    # X-Forwarded-Forヘッダーをチェック（プロキシ経由の場合）
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # 最初のIPアドレスを取得（カンマ区切りの場合）
        return forwarded_for.split(",")[0].strip()
    
    # X-Real-IPヘッダーをチェック（Nginx等）
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # 直接アクセスの場合
    return request.client.host if request.client else "unknown"

@router.post("/", response_model=schemas.Contact)
def create_contact(contact: schemas.ContactCreate, request: Request, db: Session = Depends(get_db)):
    # クライアントIPアドレスを取得
    client_ip = get_client_ip(request)
    
    # レート制限チェック
    is_allowed, limit_info = rate_limiter.is_allowed(client_ip)
    
    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Too Many Requests",
                "message": f"IP {client_ip} has exceeded the rate limit. You can send {limit_info['max_requests']} requests per {limit_info['time_window_minutes']} minutes.",
                "retry_after_seconds": limit_info['retry_after_seconds'],
                "retry_after_minutes": limit_info['retry_after_minutes'],
                "current_requests": limit_info['current_requests'],
                "max_requests": limit_info['max_requests']
            },
            headers={"Retry-After": str(limit_info['retry_after_seconds'])}
        )
    
    return crud.create_contact(db=db, contact=contact)

@router.get("/", response_model=List[schemas.Contact])
def read_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    contacts = crud.get_contacts(db, skip=skip, limit=limit)
    return contacts

@router.get("/{contact_id}", response_model=schemas.Contact)
def read_contact(contact_id: int, db: Session = Depends(get_db)):
    db_contact = crud.get_contact(db, contact_id=contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact

@router.put("/{contact_id}", response_model=schemas.Contact)
def update_contact(contact_id: int, contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    db_contact = crud.update_contact(db, contact_id=contact_id, contact=contact)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact

@router.get("/rate-limit/status")
def get_rate_limit_status(request: Request, response: Response):
    """
    現在のIPアドレスのレート制限状態を取得（高速化・キャッシュ対応）
    """
    try:
        client_ip = get_client_ip(request)
        status = rate_limiter.get_status(client_ip)
        
        # キャッシュヘッダー設定（5秒間キャッシュ）
        response.headers["Cache-Control"] = "public, max-age=5"
        response.headers["X-Client-IP"] = client_ip
        
        return JSONResponse(
            content=status,
            headers={
                "X-RateLimit-Limit": str(status["max_requests"]),
                "X-RateLimit-Remaining": str(status["remaining_requests"]),
                "X-RateLimit-Window": f"{status['time_window_minutes']}m"
            }
        )
    except Exception as e:
        logger.error(f"Rate limit status check failed for IP {client_ip}: {e}")
        return JSONResponse(
            content={"error": "Status check failed"},
            status_code=500
        )

@router.post("/rate-limit/reset/{ip_address}")
def reset_rate_limit(ip_address: str):
    """
    指定したIPアドレスのレート制限をリセット（管理者用）
    注意: 本番環境では認証や許可チェックを追加してください
    """
    rate_limiter.reset_ip(ip_address)
    return {"message": f"Rate limit reset for IP: {ip_address}"}

@router.get("/rate-limit/check")
def check_rate_limit(request: Request, response: Response):
    """
    レート制限チェック（送信前の確認用・高速化版）
    実際にはカウントしないで、現在の状態だけを返す
    """
    try:
        client_ip = get_client_ip(request)
        status = rate_limiter.get_status(client_ip)
        
        # 制限に近づいている場合は警告
        remaining = status['remaining_requests']
        is_warning = remaining <= 1 and remaining > 0
        
        # 短時間キャッシュ（3秒）
        response.headers["Cache-Control"] = "public, max-age=3"
        
        result = {
            "ip_address": client_ip,
            "status": status,
            "warning": is_warning,
            "message": f"あと{remaining}回送信可能です" if remaining > 0 else "送信制限に達しています"
        }
        
        return JSONResponse(
            content=result,
            headers={
                "X-RateLimit-Check": "true",
                "X-RateLimit-Remaining": str(remaining)
            }
        )
    except Exception as e:
        logger.error(f"Rate limit check failed for IP {client_ip}: {e}")
        return JSONResponse(
            content={
                "status": {"remaining_requests": 999, "is_limited": False},
                "warning": False,
                "message": "チェック中にエラーが発生しました"
            },
            status_code=200  # エラーでも送信は許可
        )