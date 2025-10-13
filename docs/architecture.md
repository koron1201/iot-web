# システムアーキテクチャ

## 概要

スマートICTソリューション研究室Webサイトプロジェクトのシステムアーキテクチャ設計書です。

## アーキテクチャ概要

### システム構成
```
[フロントエンド] ←→ [バックエンド] ←→ [データベース]
     ↓                    ↓              ↓
[ユーザーインターフェース] [API サーバー] [データストレージ]
```

### アーキテクチャパターン
- **フロントエンド**: SPA（Vite + React + React Router）
- **バックエンド**: Node.js + Fastify + TypeScript
- **データベース**: PostgreSQL

## コンポーネント構成

### フロントエンド層
- **UI/UX**: Tailwind CSS v3.4（`tailwindcss-animate`） + shadcn/ui（候補）
- **状態管理**: Zustand
- **ルーティング**: React Router v7（確定）
- **アニメーション**: Framer Motion（確定）
- **3D/Canvas**: react-three-fiber + drei（確定）
- **API通信**: TanStack Query（React Query）

### バックエンド層
- **APIサーバー**: Fastify + TypeScript
- **認証・認可**: JWT + Passport.js
- **ビジネスロジック**: サービス層パターン
- **データアクセス**: Prisma ORM

### データ層
- **データベース**: PostgreSQL
- **キャッシュ**: Redis（将来検討）
- **ファイルストレージ**: Vercel Blob / AWS S3

## セキュリティ設計

### 認証・認可
- **認証方式**: JWT（JSON Web Token）
- **セッション管理**: ステートレス（JWT）
- **権限管理**: ロールベースアクセス制御（RBAC）

### データ保護
- **暗号化**: HTTPS（TLS 1.3）、データベース暗号化
- **データバックアップ**: 自動バックアップ（日次）
- **アクセス制御**: API認証、CORS設定

## パフォーマンス設計

### スケーラビリティ
- **水平スケーリング**: Vercel/Railway自動スケーリング
- **垂直スケーリング**: クラウドプラットフォーム対応
- **ロードバランシング**: Nginx（小規模）、AWS ALB（大規模）

### 最適化
- **キャッシュ戦略**: ブラウザキャッシュ、CDN、APIレスポンスキャッシュ
- **データベース最適化**: インデックス最適化、クエリ最適化
- **CDN**: Cloudflare
- **3D最適化**: 低優先モバイル向けにフォールバック検討、デスクトップ優先で描画

## 監視・運用

### ログ管理
- **ログレベル**: ERROR, WARN, INFO, DEBUG
- **ログ収集**: Vercel Logs + Sentry
- **ログ分析**: Sentry Error Tracking

### 監視
- **ヘルスチェック**: Vercel Health Check + Railway Health Check
- **メトリクス収集**: Vercel Analytics + Sentry Performance
- **アラート設定**: Sentry Alerts + GitHub Dependabot

## デプロイメント

### 環境構成
- **開発環境**: ローカル開発（Docker Compose）
- **ステージング環境**: Vercel Preview + Railway Staging
- **本番環境**: Vercel Production + Railway Production

### CI/CD
- **ビルドパイプライン**: GitHub Actions
- **テスト自動化**: Vitest + GitHub Actions
- **デプロイ自動化**: Vercel + Railway自動デプロイ

## 更新履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|------------|----------|--------|
| 2025-01-15 | v1.0 | 初版作成 | プロジェクトチーム |
| 2025-10-12 | v1.1 | フロントエンドをSPA（Vite+React）、UI/ルーティング候補、3D最適化方針を反映 | フロントエンド担当 |
| 2025-10-12 | v1.2 | ルーティング・アニメーション・3Dライブラリを確定。Tailwind v3 採用に更新 | フロントエンド担当 |

## 参考資料

- https://haru-ni.net（参考サイト）
- https://codeforyamaguchi.org（参考プロジェクト）
