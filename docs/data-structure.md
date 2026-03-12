# データ構造設計

## 概要

スマートICTソリューション研究室Webサイトプロジェクトのデータ構造設計書です。

## データベース設計

### データベース概要
- **データベース種類**: PostgreSQL
- **バージョン**: 16系
- **文字エンコーディング**: UTF-8

### テーブル設計

#### ユーザー関連テーブル
```
users (ユーザー情報)
├── id: UUID (Primary Key)
├── username: VARCHAR(50) (Unique)
├── email: VARCHAR(255) (Unique)
├── password_hash: VARCHAR(255)
├── role: ENUM('admin', 'editor', 'viewer')
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP
```

#### 研究室関連テーブル
```
research_members (研究室メンバー)
├── id: UUID (Primary Key)
├── name: VARCHAR(100)
├── position: VARCHAR(100)
├── email: VARCHAR(255)
├── profile_image: VARCHAR(500)
├── bio: TEXT
├── research_interests: TEXT[]
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP
```

#### 研究内容関連テーブル
```
research_projects (研究プロジェクト)
├── id: UUID (Primary Key)
├── title: VARCHAR(200)
├── description: TEXT
├── status: ENUM('planning', 'active', 'completed', 'cancelled')
├── start_date: DATE
├── end_date: DATE
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP
```

#### 論文・研究成果関連テーブル
```
papers (論文)
├── id: UUID (Primary Key)
├── title: VARCHAR(500)
├── authors: TEXT[]
├── journal: VARCHAR(200)
├── publication_date: DATE
├── doi: VARCHAR(100)
├── abstract: TEXT
├── keywords: TEXT[]
├── pdf_url: VARCHAR(500)
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP
```

#### イベント・セミナー関連テーブル
```
events (イベント)
├── id: UUID (Primary Key)
├── title: VARCHAR(200)
├── description: TEXT
├── event_date: TIMESTAMP
├── location: VARCHAR(200)
├── event_type: ENUM('seminar', 'conference', 'workshop', 'other')
├── registration_url: VARCHAR(500)
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP
```

#### ニュース・お知らせ関連テーブル
```
news (ニュース)
├── id: UUID (Primary Key)
├── title: VARCHAR(200)
├── content: TEXT
├── category: ENUM('news', 'announcement', 'research', 'event')
├── published_at: TIMESTAMP
├── is_published: BOOLEAN
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP
```

## データ関係図

### ER図
```
[ユーザー] 1---* [研究プロジェクト]
[ユーザー] 1---* [論文]
[研究プロジェクト] 1---* [論文]
[研究室メンバー] 1---* [研究プロジェクト]
[研究室メンバー] 1---* [論文]
```

### 外部キー関係
- users.id → research_members.user_id
- research_members.id → research_projects.lead_member_id
- research_projects.id → papers.project_id
- users.id → papers.author_id

## インデックス設計

### 主要インデックス
- users.email (Unique Index)
- users.username (Unique Index)
- papers.publication_date (B-tree Index)
- events.event_date (B-tree Index)
- news.published_at (B-tree Index)

### 複合インデックス
- papers(author_id, publication_date)
- events(event_type, event_date)
- news(category, published_at)

## データ制約

### 主キー制約
- 全テーブルのidカラム（UUID型）

### 外部キー制約
- research_members.user_id → users.id
- research_projects.lead_member_id → research_members.id
- papers.project_id → research_projects.id
- papers.author_id → users.id

### チェック制約
- users.role IN ('admin', 'editor', 'viewer')
- research_projects.status IN ('planning', 'active', 'completed', 'cancelled')
- events.event_type IN ('seminar', 'conference', 'workshop', 'other')
- news.category IN ('news', 'announcement', 'research', 'event')

### ユニーク制約
- users.email
- users.username

## データ移行

### 初期データ
- 管理者ユーザー（admin）
- 研究室基本情報
- サンプル研究プロジェクト

### データ移行手順
- Prismaマイグレーション
- シードデータ投入
- データ整合性チェック

## バックアップ・復旧

### バックアップ戦略
- **フルバックアップ**: 日次自動バックアップ
- **増分バックアップ**: 6時間毎
- **差分バックアップ**: 週次

### 復旧手順
- バックアップからの復旧
- データ整合性確認
- アプリケーション再起動

## パフォーマンス最適化

### クエリ最適化
- インデックス最適化
- クエリ実行計画分析
- N+1問題の解決

### キャッシュ戦略
- データベースクエリキャッシュ
- APIレスポンスキャッシュ
- 静的コンテンツキャッシュ

## セキュリティ

### データ暗号化
- データベース暗号化（TDE）
- パスワードハッシュ化（bcrypt）
- 通信暗号化（TLS 1.3）

### アクセス制御
- ロールベースアクセス制御（RBAC）
- API認証（JWT）
- データベースアクセス制限

### 監査ログ
- データ変更ログ
- アクセスログ
- エラーログ

## 更新履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|------------|----------|--------|
| 2025-01-15 | v1.0 | 初版作成 | プロジェクトチーム |

## 参考資料

- https://haru-ni.net（参考サイト）
- https://codeforyamaguchi.org（参考プロジェクト）
