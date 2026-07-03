# Vercel 公開手順（Public 版）

Public 版は SQLite を Vercel 上で使わず、`src/data/public-site.json` に焼き込んだ静的データで動作します。

## 1. 公開データを更新（Local で作業後）

```bash
npm run build:public-data
```

`src/data/public-site.json` が更新されます。このファイルを Git にコミットしてください。

## 2. Vercel にデプロイ

### 方法 A: Vercel CLI

```bash
npx vercel login
npx vercel --prod
```

プロジェクトルート: `vanishing-life-archive`

### 方法 B: GitHub 連携

1. リポジトリを GitHub に push
2. [vercel.com](https://vercel.com) → New Project → リポジトリを import
3. Framework: **Next.js**（自動検出）
4. Build Command: `npm run vercel-build`（`vercel.json` で設定済み）
5. Environment Variables（Production）:
   - `PUBLIC_STATIC_DATA` = `1`
   - `NEXT_PUBLIC_PUBLIC_SITE` = `1`

**API キー（OPENAI / YOUTUBE）は Public 版では不要**です。

## 3. 公開後の URL

- `/` → Public Home（Local Home と同構成、Article Drafts なし）
- `/public-preview/videos` → 公開 Videos 一覧
- Local 用ページ（`/videos`, `/export`, `/run` 等）は `/public-preview` へリダイレクト

## 4. コンテンツ更新フロー

1. Local Observatory で観測・分析・`public_ready` 設定
2. `npm run build:public-data`
3. `git commit` → push → Vercel が自動再デプロイ

## 注意

- `dev.db` は Vercel にアップロードされません（`.gitignore` 対象）
- 公開データは必ず `build:public-data` で JSON を更新してからデプロイしてください
