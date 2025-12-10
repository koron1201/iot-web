# IP別レート制限機能の使用方法

## 概要
同一IPアドレスから短時間に大量のお問い合わせが送信されることを防ぐため、IP別レート制限機能を実装しました。

## 設定
- **デフォルト制限**: 1時間に3回まで
- **制限時間**: 60分
- **環境変数で変更可能**:
  - `CONTACT_MAX_REQUESTS`: 最大リクエスト数
  - `CONTACT_TIME_WINDOW`: 制限時間（分）

## API エンドポイント

### 1. お問い合わせ送信 (既存)
```
POST /contact/
```
レート制限チェックが自動的に実行されます。

**制限に達した場合のレスポンス (HTTP 429):**
```json
{
  "detail": {
    "error": "Too Many Requests",
    "message": "IP 192.168.1.1 has exceeded the rate limit. You can send 3 requests per 60 minutes.",
    "retry_after_seconds": 3420,
    "retry_after_minutes": 57,
    "current_requests": 3,
    "max_requests": 3
  }
}
```

### 2. レート制限状態確認
```
GET /contact/rate-limit/status
```
**レスポンス:**
```json
{
  "ip_address": "192.168.1.1",
  "current_requests": 2,
  "max_requests": 3,
  "time_window_minutes": 60,
  "remaining_requests": 1,
  "is_limited": false
}
```

### 3. 送信前チェック
```
GET /contact/rate-limit/check
```
**レスポンス:**
```json
{
  "ip_address": "192.168.1.1",
  "status": {
    "current_requests": 2,
    "max_requests": 3,
    "remaining_requests": 1
  },
  "warning": true,
  "message": "あと1回送信可能です"
}
```

### 4. レート制限リセット（管理者用）
```
POST /contact/rate-limit/reset/{ip_address}
```

## フロントエンド実装例

### JavaScript での送信前チェック
```javascript
async function checkRateLimit() {
  try {
    const response = await fetch('/api/contact/rate-limit/check');
    const data = await response.json();
    
    if (data.status.is_limited) {
      alert('送信制限に達しています。しばらく時間をおいてからお試しください。');
      return false;
    }
    
    if (data.warning) {
      const confirm = window.confirm(`${data.message}\n続行しますか？`);
      return confirm;
    }
    
    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // エラー時は送信を許可
  }
}

async function submitContact(formData) {
  // 送信前チェック
  const canSubmit = await checkRateLimit();
  if (!canSubmit) return;
  
  try {
    const response = await fetch('/api/contact/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.status === 429) {
      const error = await response.json();
      const minutes = error.detail.retry_after_minutes;
      alert(`送信制限に達しました。${minutes}分後に再度お試しください。`);
      return;
    }
    
    if (response.ok) {
      alert('お問い合わせを受け付けました。');
    }
  } catch (error) {
    console.error('Submit failed:', error);
  }
}
```

### React での実装例
```jsx
import { useState, useEffect } from 'react';

function ContactForm() {
  const [rateLimitStatus, setRateLimitStatus] = useState(null);
  const [canSubmit, setCanSubmit] = useState(true);
  
  // コンポーネント読み込み時にレート制限状態をチェック
  useEffect(() => {
    checkRateLimit();
  }, []);
  
  const checkRateLimit = async () => {
    try {
      const response = await fetch('/api/contact/rate-limit/status');
      const status = await response.json();
      setRateLimitStatus(status);
      setCanSubmit(!status.is_limited);
    } catch (error) {
      console.error('Rate limit check failed:', error);
    }
  };
  
  const handleSubmit = async (formData) => {
    if (!canSubmit) {
      alert('送信制限に達しています。');
      return;
    }
    
    // 送信処理...
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {rateLimitStatus && rateLimitStatus.remaining_requests <= 1 && (
        <div className="warning">
          ⚠️ あと{rateLimitStatus.remaining_requests}回送信可能です
        </div>
      )}
      
      {!canSubmit && (
        <div className="error">
          🚫 送信制限に達しています。しばらく時間をおいてからお試しください。
        </div>
      )}
      
      <button type="submit" disabled={!canSubmit}>
        送信
      </button>
    </form>
  );
}
```

## 特徴
- **メモリベース**: シンプルで高速（Redis不要）
- **自動クリーンアップ**: 古いレコードを定期的に削除
- **設定可能**: 環境変数で制限値を変更可能
- **プロキシ対応**: X-Forwarded-For, X-Real-IPヘッダーに対応
- **管理機能**: 特定IPの制限リセット可能

## 注意事項
- サーバー再起動時にレート制限情報はリセットされます
- 複数サーバー環境では各サーバーで個別管理されます（Redis実装推奨）
- 管理者用エンドポイントには本番環境で認証を追加してください