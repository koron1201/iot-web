# ディレクトリ構造

## 概要

スマートICTソリューション研究室Webサイトプロジェクトのディレクトリ構造設計書です。

## プロジェクト全体構造

```
iot-web/
├── Frontend/                 # フロントエンドアプリケーション
│   ├── src/                 # ソースコード（Vite + React + TS）
│   │   ├── components/      # Reactコンポーネント
│   │   ├── pages/           # ページコンポーネント
│   │   ├── hooks/           # カスタムフック
│   │   ├── utils/           # ユーティリティ関数
│   │   ├── services/        # APIサービス
│   │   ├── styles/          # スタイルファイル
│   │   ├── assets/          # 静的ファイル
│   │   └── types/           # TypeScript型定義
│   ├── public/              # パブリックファイル
│   ├── tests/               # テストファイル
│   ├── docs/                # フロントエンド固有ドキュメント
│   ├── package.json         # 依存関係管理
│   ├── tsconfig.json        # TypeScript設定
│   ├── tailwind.config.js   # Tailwind v3 設定
│   ├── postcss.config.js    # PostCSS 設定（tailwindcss + autoprefixer）
│   ├── vite.config.ts       # Vite 設定（@vitejs/plugin-react）
│   └── index.html           # エントリ HTML（#root）
├── Backend/                 # バックエンドアプリケーション
│   ├── src/                 # ソースコード
│   │   ├── controllers/     # コントローラー
│   │   ├── models/          # データモデル
│   │   ├── services/        # ビジネスロジック
│   │   ├── routes/          # ルーティング
│   │   ├── middleware/      # ミドルウェア
│   │   ├── utils/           # ユーティリティ関数
│   │   ├── config/          # 設定ファイル
│   │   └── types/           # TypeScript型定義
│   ├── tests/               # テストファイル
│   ├── docs/                # バックエンド固有ドキュメント
│   ├── package.json         # 依存関係管理
│   ├── tsconfig.json        # TypeScript設定
│   └── .env.example         # 環境変数サンプル
├── docs/                    # プロジェクト全体ドキュメント
│   ├── design/              # 設計ドキュメント
│   │   ├── ui-ux/           # UI/UX設計書
│   │   ├── database/        # データベース設計書
│   │   ├── api/             # API仕様書
│   │   └── system/          # システム構成図
│   ├── development/         # 開発ドキュメント
│   │   ├── guidelines/      # 開発ガイドライン
│   │   ├── coding-standards/ # コーディング規約
│   │   ├── deployment/      # デプロイ手順書
│   │   └── testing/         # テスト仕様書
│   ├── operation/           # 運用ドキュメント
│   │   ├── manual/          # 運用手順書
│   │   ├── troubleshooting/ # トラブルシューティング
│   │   ├── backup/          # バックアップ手順
│   │   └── security/        # セキュリティ対策
│   ├── research/            # 研究室固有ドキュメント
│   │   ├── content/         # 研究内容詳細
│   │   ├── papers/          # 論文・研究成果
│   │   ├── events/          # イベント・セミナー資料
│   │   └── members/         # メンバー向けマニュアル
│   ├── architecture.md      # システムアーキテクチャ
│   ├── data-structure.md    # データ構造設計
│   ├── directory-structure.md # ディレクトリ構造（このファイル）
│   ├── implementation-task.md # 実装タスク
│   ├── requirement.md       # 要件定義
│   ├── tech-stack.md        # 技術スタック
│   └── README.md            # ドキュメント概要
├── .github/                 # GitHub設定
│   ├── workflows/           # GitHub Actions
│   └── ISSUE_TEMPLATE/      # Issueテンプレート
├── .vscode/                 # VS Code設定
│   ├── settings.json        # ワークスペース設定
│   ├── extensions.json      # 推奨拡張機能
│   └── launch.json          # デバッグ設定
├── docker/                  # Docker設定
│   ├── frontend/            # フロントエンド用Dockerfile
│   ├── backend/             # バックエンド用Dockerfile
│   └── docker-compose.yml   # Docker Compose設定
├── scripts/                 # スクリプトファイル
│   ├── setup.sh             # 環境構築スクリプト
│   ├── build.sh             # ビルドスクリプト
│   ├── deploy.sh            # デプロイスクリプト
│   └── test.sh              # テスト実行スクリプト
├── .gitignore               # Git除外設定
├── .env.example             # 環境変数サンプル
├── README.md                # プロジェクト概要
└── package.json             # ワークスペース設定
```

## フロントエンド詳細構造

### src/ディレクトリ（現状の最小構成）
```
Frontend/src/
├── main.tsx                 # React エントリ（Router あり）
├── main.ts                  # 互換ファイル（未使用）
├── style.css                # Tailwind のエントリ（CSS 変数/テーマ）
├── counter.ts               # Vite テンプレ残存（今後削除予定）
└── typescript.svg           # テンプレ用アセット
```

## バックエンド詳細構造

### src/ディレクトリ
```
Backend/src/
├── controllers/             # コントローラー
│   ├── authController.ts    # 認証コントローラー
│   ├── userController.ts    # ユーザーコントローラー
│   ├── researchController.ts # 研究関連コントローラー
│   ├── newsController.ts    # ニュースコントローラー
│   └── adminController.ts   # 管理画面コントローラー
├── models/                  # データモデル
│   ├── User.ts              # ユーザーモデル
│   ├── Research.ts          # 研究関連モデル
│   ├── News.ts              # ニュースモデル
│   └── Paper.ts             # 論文モデル
├── services/                # ビジネスロジック
│   ├── authService.ts       # 認証サービス
│   ├── userService.ts       # ユーザーサービス
│   ├── researchService.ts   # 研究関連サービス
│   └── newsService.ts       # ニュースサービス
├── routes/                  # ルーティング
│   ├── auth.ts              # 認証ルート
│   ├── users.ts             # ユーザールート
│   ├── research.ts          # 研究関連ルート
│   ├── news.ts              # ニュースルート
│   └── admin.ts             # 管理画面ルート
├── middleware/              # ミドルウェア
│   ├── auth.ts              # 認証ミドルウェア
│   ├── validation.ts        # バリデーションミドルウェア
│   ├── errorHandler.ts      # エラーハンドリング
│   └── cors.ts              # CORS設定
├── utils/                   # ユーティリティ関数
│   ├── database.ts          # データベース接続
│   ├── jwt.ts               # JWT処理
│   ├── validation.ts        # バリデーション関数
│   └── logger.ts            # ログ出力
├── config/                  # 設定ファイル
│   ├── database.ts          # データベース設定
│   ├── jwt.ts               # JWT設定
│   ├── cors.ts              # CORS設定
│   └── env.ts               # 環境変数設定
└── types/                   # TypeScript型定義
    ├── express.ts           # Express型拡張
    ├── user.ts              # ユーザー型定義
    ├── research.ts          # 研究関連型定義
    └── common.ts            # 共通型定義
```

## 命名規則

### ディレクトリ名
- **小文字**: 一般的なディレクトリ名
- **PascalCase**: コンポーネントディレクトリ
- **kebab-case**: 設定ファイルディレクトリ

### ファイル名
- **PascalCase**: Reactコンポーネントファイル
- **camelCase**: ユーティリティ関数ファイル
- **kebab-case**: 設定ファイル
- **UPPERCASE**: 定数ファイル

## ファイル配置ルール

### コンポーネント配置
- 再利用可能なコンポーネントは `components/` に配置
- ページ固有のコンポーネントは `pages/` に配置
- 共通コンポーネントは `components/common/` に配置

### スタイル配置
- グローバルスタイルは `styles/globals.css` に配置
- コンポーネント固有スタイルは各コンポーネントディレクトリに配置
- ページ固有スタイルは `styles/pages/` に配置

### 型定義配置
- 共通型定義は `types/common.ts` に配置
- 機能固有型定義は `types/` に配置
- API型定義は `types/api.ts` に配置

## 依存関係管理

### パッケージ管理
- **npm**: パッケージマネージャー
- **package.json**: 依存関係定義
- **package-lock.json**: 依存関係ロック

### モジュール解決
- **絶対パス**: `@/` エイリアスで `src/` を参照
- **相対パス**: 同一ディレクトリ内のファイル参照
- **外部パッケージ**: `node_modules/` から解決

## 更新履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|------------|----------|--------|
| まだ決まっていない | v1.0 | 初版作成 | まだ決まっていない |

## 参考資料

- まだ決まっていない
