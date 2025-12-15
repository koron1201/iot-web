# フロントエンド開発ガイド

## 概要
- Vite + React + TypeScript + Tailwind CSS 構成の SPA。
- 3D 表現に `three` / `@react-three/fiber`、UI に Radix UI と shadcn/ui ベースのコンポーネントを使用。
- FastAPI 製バックエンド (デフォルト `http://localhost:8000`) からニュース・研究・問い合わせ等のデータを取得します。

## 必須環境
- Node.js 20 LTS 以降（動作確認: 20.11.1）
- npm 10 以降（Node 同梱版で可）
- Git / PowerShell もしくは任意のシェル
- WebGL 対応ブラウザ（Chrome / Edge 最新版を推奨）

## セットアップ手順
1. リポジトリを取得  
   `git clone https://.../iot-web.git`
2. フロントエンドディレクトリへ移動  
   `cd iot-web/Frontend`
3. 依存関係をインストール  
   `npm install`
4. 開発サーバーを起動  
   `npm run dev` → 既定で `http://localhost:5173`
5. FastAPI バックエンドを `http://localhost:8000` で起動しておく（問い合わせや投稿などで必須）

## 利用可能な npm スクリプト
| コマンド | 説明 |
| --- | --- |
| `npm run dev` | HMR 付き開発サーバーを起動 |
| `npm run build` | TypeScript 型チェック + 本番ビルドを `dist/` に出力 |
| `npm run preview` | ビルド済み成果物のローカル確認 |


## ブラウザでの確認
- `npm run dev -- --host 0.0.0.0` で LAN 内デバイスからの確認が可能。
- 3D 背景表示が黒画面の場合は WebGL が無効になっていないかブラウザ設定を確認してください。

## トラブルシューティング
- **依存関係インストール時にエラー**: `node -v` で 20 系であることを確認し、古い `node_modules` を削除して再実行してください。
- **API 呼び出しが失敗する**: FastAPI 側が起動しているか、`http://localhost:8000` へアクセスできるか確認してください。プロキシや VPN がブロックする場合があります。
- **ビルドが失敗する**: TypeScript 型エラーが表示された場合、該当ファイルを修正後に `npm run build` を再実行します。

## ディレクトリ構成（抜粋）
```
Frontend/
├─ public/           … 静的アセット
├─ src/
│  ├─ components/    … UI・レイアウト・3D 背景など
│  ├─ routes/        … react-router による画面
│  ├─ context/       … 認証などの状態管理
│  └─ lib/           … API 呼び出しやユーティリティ
└─ vite.config.ts    … Vite 設定
```

## よくある開発フロー
1. `npm run dev` でフロントエンドを起動
2. 別ターミナルで `Backend/` の FastAPI を起動
3. 機能実装 → `npm run build` で検証 → `dist/` を配信サーバーへデプロイ

環境依存の補足や質問があれば README を更新して情報を共有してください。

