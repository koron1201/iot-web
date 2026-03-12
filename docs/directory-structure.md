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
├── backend/                 # バックエンドサーバー関連のファイルを格納
│   ├── app/                 # FastAPIアプリケーションのメインソースコード
│   │   ├── __init__.py      # このディレクトリをPythonパッケージとして認識させるためのファイル
│   │   ├── main.py          # FastAPIアプリケーションを起動する中心ファイル
│   │   ├── crud/            # データベースの操作（作成, 読込, 更新, 削除）に関するロジック
│   │   │   ├── __init__.py  # crudディレクトリをパッケージとして認識させる
│   │   │   ├── research_crud.py # 研究内容に関するDB操作を記述
│   │   │   └── calendar_crud.py # カレンダーに関するDB操作を記述
│   │   ├── models/          # データベースのテーブル構造を定義するファイル（ORMモデル）
│   │   │   ├── __init__.py  # modelsディレクトリをパッケージとして認識させる
│   │   │   ├── research.py  # 研究内容テーブルのモデル
│   │   │   └── event.py     # イベントテーブルのモデル
│   │   ├── schemas/         # APIでやり取りするデータの型や形式を定義するファイル（Pydanticスキーマ）
│   │   │   ├── __init__.py  # schemasディレクトリをパッケージとして認識させる
│   │   │   ├── research.py  # 研究内容APIのデータ形式を定義
│   │   │   └── contact.py   # 問い合わせAPIのデータ形式を定義
│   │   ├── api/             # APIのエンドポイント（URLの各窓口）を定義するファイル群
│   │   │   ├── __init__.py  # apiディレクトリをパッケージとして認識させる
│   │   │   ├── api_v1.py    # APIのバージョン1のエンドポイントをまとめるファイル
│   │   │   └── endpoints/   # 各機能のエンドポイントを個別に定義
│   │   │       ├── __init__.py # endpointsディレクトリをパッケージとして認識させる
│   │   │       ├── research.py # 研究内容に関するAPI
│   │   │       ├── calendar.py # カレンダーに関するAPI
│   │   │       ├── contact.py  # 問い合わせに関するAPI
│   │   │       ├── news.py     # ニュースに関するAPI
│   │   │       └── chatbot.py  # チャットボットに関するAPI（WebSocketなど）
│   │   ├── core/            # アプリケーション全体の設定ファイルなどを格納
│   │   │   └── config.py    # 環境変数などの設定を読み込む
│   │   └── db/              # データベース接続に関する設定
│   │       └── session.py   # データベースセッションを管理
│   ├── static/              # 動画や画像など、プログラムを介さずに直接配信するファイル
│   │   └── videos/
│   │       └── intro_video.mp4 # 紹介動画ファイル
│   ├── tests/               # アプリケーションのテストコード
│   └── requirements.txt     # バックエンドで必要なPythonライブラリの一覧
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
├── metaverse_assets/         # cluster（メタバース）にアップロードする3Dモデルなどの素材置き場
│   ├── models/               # 3Dモデルファイル（.glbなど）
│   └── images/               # テクスチャなどの画像ファイル
├── .github/                  # GitHub設定
│   ├── workflows/            # GitHub Actions
│   └── ISSUE_TEMPLATE/       # Issueテンプレート
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

### app/ディレクトリ（FastAPI構成）
```
backend/app/
├── __init__.py              # Pythonパッケージ認識ファイル
├── main.py                  # FastAPIアプリケーション起動ファイル
├── crud/                    # データベース操作ロジック
│   ├── __init__.py          # crudパッケージ認識ファイル
│   ├── research_crud.py     # 研究内容DB操作
│   └── calendar_crud.py     # カレンダーDB操作
├── models/                  # データベーステーブル構造定義（ORMモデル）
│   ├── __init__.py          # modelsパッケージ認識ファイル
│   ├── research.py          # 研究内容テーブルモデル
│   └── event.py             # イベントテーブルモデル
├── schemas/                 # APIデータ型・形式定義（Pydanticスキーマ）
│   ├── __init__.py          # schemasパッケージ認識ファイル
│   ├── research.py          # 研究内容APIデータ形式
│   └── contact.py           # 問い合わせAPIデータ形式
├── api/                     # APIエンドポイント定義
│   ├── __init__.py          # apiパッケージ認識ファイル
│   ├── api_v1.py            # API v1エンドポイント統合
│   └── endpoints/           # 機能別エンドポイント
│       ├── __init__.py      # endpointsパッケージ認識ファイル
│       ├── research.py      # 研究内容API
│       ├── calendar.py      # カレンダーAPI
│       ├── contact.py       # 問い合わせAPI
│       ├── news.py          # ニュースAPI
│       └── chatbot.py       # チャットボットAPI（WebSocket）
├── core/                    # アプリケーション全体設定
│   └── config.py            # 環境変数等設定読み込み
└── db/                      # データベース接続設定
    └── session.py           # データベースセッション管理
```

### その他のバックエンドファイル
```
backend/
├── static/                  # 静的ファイル配信
│   └── videos/
│       └── intro_video.mp4  # 紹介動画ファイル
├── tests/                   # テストコード
└── requirements.txt         # Pythonライブラリ依存関係
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
|| 2025-01-15 | v1.0 | 初版作成 | プロジェクトチーム |
|| 2025-01-15 | v1.1 | バックエンド構成をFastAPIベースに更新 | バックエンド担当 |

## 参考資料

- https://haru-ni.net（参考サイト）
- https://codeforyamaguchi.org（参考プロジェクト）
