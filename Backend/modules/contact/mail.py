import requests
import os
import json
from datetime import datetime
from typing import Optional

# Discord Webhook設定
# DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL", "YOUR_DISCORD_WEBHOOK_URL_HERE")
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")
ENABLE_DISCORD = os.getenv("ENABLE_DISCORD", "true").lower() == "true"

# デバッグ用ログ
print(f"DEBUG: DISCORD_WEBHOOK_URL = {DISCORD_WEBHOOK_URL}")
print(f"DEBUG: ENABLE_DISCORD = {ENABLE_DISCORD}")

def send_contact_discord(mail: str, detail: str) -> bool:
    """
    お問い合わせをDiscordに通知する
    
    Args:
        mail (str): お問い合わせ者のメールアドレス
        detail (str): お問い合わせ内容
    
    Returns:
        bool: 送信成功時True、失敗時False
    """
    # Discord通知が無効化されている場合
    if not ENABLE_DISCORD:
        print("Discord通知が無効化されています。お問い合わせはデータベースに保存されました。")
        return True
    
    # Webhook URLが設定されていない場合
    if not DISCORD_WEBHOOK_URL or DISCORD_WEBHOOK_URL == "YOUR_DISCORD_WEBHOOK_URL_HERE":
        print("Discord Webhook URLが設定されていません。DISCORD_WEBHOOK_URL を環境変数に設定してください。")
        return False
    
    try:
        # 現在時刻を取得
        current_time = datetime.now().strftime("%Y年%m月%d日 %H:%M:%S")
        
        # Discordに送信するメッセージを作成（Embed形式）
        embed = {
            "title": "🔔 新しいお問い合わせ",
            "description": "新しいお問い合わせが届きました",
            "color": 0x00ff00,  # 緑色
            "fields": [
                {
                    "name": "📧 メールアドレス",
                    "value": mail,
                    "inline": False
                },
                {
                    "name": "💬 お問い合わせ内容",
                    "value": detail if len(detail) <= 1024 else detail[:1021] + "...",
                    "inline": False
                },
                {
                    "name": "⏰ 受信時刻",
                    "value": current_time,
                    "inline": True
                }
            ],
            "footer": {
                "text": "自動通知システム"
            }
        }
        
        # Webhook用のペイロード
        payload = {
            "embeds": [embed]
        }
        
        # Discord Webhookにメッセージを送信
        headers = {"Content-Type": "application/json"}
        response = requests.post(
            DISCORD_WEBHOOK_URL, 
            data=json.dumps(payload), 
            headers=headers
        )
        
        if response.status_code == 204:
            print(f"Discord通知送信成功: {mail} からのお問い合わせ")
            return True
        else:
            print(f"Discord通知送信失敗: ステータスコード {response.status_code}")
            #print(f"レスポンス内容: {response.text}")
            return False
            
    except Exception as e:
        print(f"Discord通知送信エラー: {str(e)}")
        return False

def send_contact_notification(contact_data: dict) -> bool:
    """
    お問い合わせ通知をDiscordに送信する（辞書形式のデータを受け取る）
    
    Args:
        contact_data (dict): お問い合わせデータ
    
    Returns:
        bool: 送信成功時True、失敗時False
    """
    mail = contact_data.get('mail', '不明')
    detail = contact_data.get('detail', '内容なし')
    
    return send_contact_discord(mail, detail)

# 下位互換性のため、元の関数名も残す
def send_contact_email(mail: str, detail: str) -> bool:
    """
    下位互換性のために残されたメソッド - 実際はDiscord通知を送信
    """
    return send_contact_discord(mail, detail)