from typing import Dict, List
from datetime import datetime, timedelta
import threading
from dataclasses import dataclass
from collections import defaultdict
import os
import time
from functools import lru_cache

@dataclass
class RateLimitConfig:
    """レート制限の設定"""
    max_requests: int = int(os.getenv("CONTACT_MAX_REQUESTS", "3"))  # 制限時間内の最大リクエスト数
    time_window_minutes: int = int(os.getenv("CONTACT_TIME_WINDOW", "60"))  # 制限時間（分）
    cleanup_interval_minutes: int = 30  # クリーンアップ間隔（分）

@dataclass
class RequestRecord:
    """リクエスト記録"""
    timestamp: datetime
    count: int = 1

class IPRateLimiter:
    """IP別レート制限機能 - パフォーマンス最適化版"""
    
    def __init__(self, config: RateLimitConfig = None):
        self.config = config or RateLimitConfig()
        self.ip_records: Dict[str, List[float]] = defaultdict(list)  # timestampをfloatで高速化
        self.lock = threading.RLock()  # 再帰ロック使用
        self.last_cleanup = time.time()
        self._status_cache = {}  # ステータスキャッシュ
        self._cache_ttl = 5.0  # キャッシュ有効期間（秒）
        
    def is_allowed(self, ip_address: str) -> tuple[bool, dict]:
        """
        指定されたIPアドレスがレート制限内かどうかをチェック（高速化版）
        
        Args:
            ip_address (str): チェック対象のIPアドレス
            
        Returns:
            tuple[bool, dict]: (許可されているか, 制限情報)
        """
        current_time = time.time()
        time_threshold = current_time - (self.config.time_window_minutes * 60)
        
        with self.lock:
            # 軽量なクリーンアップ（必要時のみ）
            if current_time - self.last_cleanup > self.config.cleanup_interval_minutes * 60:
                self._cleanup_old_records_fast()
            
            # 該当IPの古いレコードを高速フィルタ
            valid_timestamps = [
                ts for ts in self.ip_records[ip_address] 
                if ts > time_threshold
            ]
            self.ip_records[ip_address] = valid_timestamps
            
            current_requests = len(valid_timestamps)
            
            if current_requests >= self.config.max_requests:
                # 制限に達している場合
                oldest_request = min(valid_timestamps) if valid_timestamps else current_time
                retry_after_seconds = int((oldest_request + self.config.time_window_minutes * 60) - current_time)
                
                return False, {
                    "limited": True,
                    "current_requests": current_requests,
                    "max_requests": self.config.max_requests,
                    "time_window_minutes": self.config.time_window_minutes,
                    "retry_after_seconds": max(0, retry_after_seconds),
                    "retry_after_minutes": max(0, retry_after_seconds // 60)
                }
            
            # リクエストを記録
            self.ip_records[ip_address].append(current_time)
            
            return True, {
                "limited": False,
                "current_requests": current_requests + 1,
                "max_requests": self.config.max_requests,
                "time_window_minutes": self.config.time_window_minutes,
                "remaining_requests": self.config.max_requests - current_requests - 1
            }
    
    def _cleanup_old_records_fast(self):
        """古いレコードを高速クリーンアップ"""
        current_time = time.time()
        time_threshold = current_time - (self.config.time_window_minutes * 60)
        
        # 空または古いレコードを削除
        ip_to_remove = []
        for ip_address in list(self.ip_records.keys()):
            valid_timestamps = [
                ts for ts in self.ip_records[ip_address] 
                if ts > time_threshold
            ]
            
            if valid_timestamps:
                self.ip_records[ip_address] = valid_timestamps
            else:
                ip_to_remove.append(ip_address)
        
        # 空のレコードを一括削除
        for ip_address in ip_to_remove:
            del self.ip_records[ip_address]
            
        self.last_cleanup = current_time
        
    @lru_cache(maxsize=1000)
    def _get_cached_status(self, ip_address: str, cache_key: int) -> dict:
        """キャッシュされたステータス取得（内部使用）"""
        return self._compute_status(ip_address)
    
    def _compute_status(self, ip_address: str) -> dict:
        """ステータス計算（キャッシュ用内部メソッド）"""
        current_time = time.time()
        time_threshold = current_time - (self.config.time_window_minutes * 60)
        
        # 古いレコードを除外して計算
        valid_requests = [
            ts for ts in self.ip_records.get(ip_address, [])
            if ts > time_threshold
        ]
        
        current_requests = len(valid_requests)
        
        return {
            "ip_address": ip_address,
            "current_requests": current_requests,
            "max_requests": self.config.max_requests,
            "time_window_minutes": self.config.time_window_minutes,
            "remaining_requests": max(0, self.config.max_requests - current_requests),
            "is_limited": current_requests >= self.config.max_requests
        }

    def get_status(self, ip_address: str) -> dict:
        """指定されたIPアドレスの現在の状況を取得（キャッシュ対応）"""
        current_time = time.time()
        
        # キャッシュチェック
        cache_key = int(current_time // self._cache_ttl)
        cached_result = self._get_cached_status(ip_address, cache_key)
        
        return cached_result
    
    def reset_ip(self, ip_address: str):
        """指定されたIPアドレスの制限をリセット（管理者用）"""
        with self.lock:
            if ip_address in self.ip_records:
                del self.ip_records[ip_address]

# グローバルなレートリミッターインスタンス
rate_limiter = IPRateLimiter()