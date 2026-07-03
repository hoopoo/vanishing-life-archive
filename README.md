# Vanishing Life Archive / 生活の消失ログ

SHIRO & Co. のための、YouTube 上の「消えゆく生活」を観測・分類・記録する MVP です。

生活は、消える直前に撮られはじめる。  
このアプリは、閉店・廃校・廃村・古民家・商店街・祖父母の家などの動画メタデータを **Kosuke Protocol** に基づいて解釈し、Field Note として保存します。

動画検索ツールではなく、**未来の民俗資料館** のための観測台帳です。

---

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| スタック | Next.js (App Router) + TypeScript + Tailwind CSS + Prisma + SQLite |
| 外部 API | YouTube Data API v3、OpenAI API |
| データ | Seed Keyword → YouTube 検索 → 動画保存 → LLM 分析 → Field Note |

### 主要ページ

- **Home** — 概要、Field Notes、Article / Meaning Layer 候補、Clusters、Article Drafts
- **Videos** — 観測済み動画一覧（キュレーション操作・フィルター付き）
- **Video Detail** — Kosuke Protocol 分析、Human Note、記事化候補
- **Seeds** — 観測用キーワード管理
- **Article Studio** — 記事化候補の束ね・記事案生成
- **Export** — Public Export（JSON / Markdown / Bundle）
- **Public Preview** — 外部公開版のプレビュー

---

## Local版とPublic版

| | Local Observatory | Public Preview / Export |
|--|--|--|
| 目的 | 観測・選別・分析の作業場 | 公開メディア向けの出力 |
| 含む | APIキー、YouTube検索、未選別動画、Human Note、AI分析ログ、Article Studio、Cluster作業、Draft | 承認済み Field Notes / Articles / Cluster Summaries / Source Videos のみ |
| パス | `/` ほか通常ナビ | `/public-preview`、`/export` |

画面上部に **LOCAL OBSERVATORY** / **PUBLIC PREVIEW** バナーが表示されます。

### publishStatus

| 値 | 意味 |
|----|------|
| `private` | 非公開（デフォルト） |
| `reviewing` | レビュー中 |
| `public_ready` | 公開準備完了 — Export キューに載る |
| `published` | 公開済み — Export 対象 |

Export 対象は `public_ready` または `published` のみ。

### Human Note と Public Note

- **Human Note** — 内部観測メモ。Public Export **に含めない**。
- **Public Note** — 外部公開してよい文章。Field Note の subtitle として Export 可能。

Video Detail で両方を分けて編集します。

### Export 方法

1. 各コンテンツの `publishStatus` を `public_ready` に設定
2. `/export` を開く
3. **Public Bundle JSON** または **Markdown Export** をダウンロード
4. `/public-preview` で Export 前の見え方を確認

### Public Bundle JSON 仕様

```json
{
  "generatedAt": "ISO8601",
  "fieldNotes": [{ "slug", "title", "subtitle", "category", "body", "question", "tags", "sourceVideoIds", "createdAt", "updatedAt" }],
  "articles": [{ "slug", "title", "subtitle", "lead", "body", "questions", "tags", "sourceVideoIds", "createdAt", "updatedAt" }],
  "clusters": [{ "slug", "title", "description", "summary", "question", "articleAngles", "tags", "sourceVideoIds" }],
  "sourceVideos": [{ "id", "title", "channelTitle", "url", "thumbnailUrl", "publishedAt" }]
}
```

**含めないもの:** rawJson、API keys、comments、Human Note、internal curationStatus、analysis prompt、model logs、未公開動画、private drafts。

### 外部公開時の注意

- Source Video は YouTube タイトル・URL・チャンネル・サムネイルのみ
- Field Note の body は Analysis.fieldNote（編集済み観測文）
- 公開前に必ず Public Preview で確認すること

---

## セットアップ

### 1. 依存関係のインストール

```bash
cd vanishing-life-archive
npm install
```

### 2. 環境変数

`.env.local.example` をコピーして `.env.local` を作成します。

```bash
cp .env.local.example .env.local
```

```env
DATABASE_URL="file:./dev.db"
YOUTUBE_API_KEY="your-youtube-api-key"
OPENAI_API_KEY="your-openai-api-key"
```

- **YOUTUBE_API_KEY** と **OPENAI_API_KEY** は空でも起動できます（mock モードで動作）
- API キーはコードに直書きしないでください

### 3. データベース

```bash
npm run db:migrate   # 初回: prisma migrate dev
npm run db:seed      # Seed Keyword 20件を投入
```

または:

```bash
npx prisma migrate dev
npx tsx prisma/seed.ts
```

### 4. 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3001](http://localhost:3001) を開きます。

---

## YouTube API Key の設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. **YouTube Data API v3** を有効化
3. API キーを作成
4. `.env.local` の `YOUTUBE_API_KEY` に設定

### 使い方

- **Seeds** ページ: 個別キーワードで「この Keyword で検索」
- **Run Observation** ページ: 「全 Seed Keyword で YouTube 検索」
- API: `POST /api/youtube/search` `{ "keyword": "廃校 記録", "maxResults": 10 }`

キーワードごとに最大 10 件取得。`videoId` の重複は保存しません。

---

## OpenAI API Key の設定

1. [OpenAI Platform](https://platform.openai.com/) で API キーを取得
2. `.env.local` の `OPENAI_API_KEY` に設定

### 使い方

- **Run Observation** ページ: 「未分析動画を LLM 分析」
- API: `POST /api/analyze/:videoId`
- API: `POST /api/analyze-unprocessed`

モデル: `gpt-4o-mini`（JSON 出力）

キーが未設定の場合、mock 分析または事前定義の mock Field Note を使用します。

---

## Mock data 実行方法

API キーなしで全体を試す場合:

1. `npm run dev` で起動
2. [http://localhost:3000/run](http://localhost:3000/run) を開く
3. **「Mock data でテスト実行」** をクリック

または curl:

```bash
curl -X POST http://localhost:3000/api/mock/import \
  -H "Content-Type: application/json" \
  -d '{"includeAnalysis": true}'
```

6 件のサンプル動画と Field Note が SQLite に保存されます。

---

## Kosuke Protocol

動画を 4 段階で処理します。

### 1. Observe（観測）

タイトル、説明、チャンネル、統計、コメントなどメタデータから、何が記録されているかを観測する。

### 2. Sample（分類）

7 カテゴリに分類（拡張後は 12 カテゴリ）:

1. 消えた場所
2. 消えかける生活技術
3. 家族記録
4. 移住・再生活
5. ノスタルジー商品化
6. 消失の実況
7. 生活インフラの記録 — 自販機、銭湯、商店街など、生活インフラが記憶装置に変わる過程
8. 地域の葬送 — 閉店、廃線、廃校、取り壊し、最後の日
9. 家庭内民俗 — 祖父母の家、実家、帰省、台所、ホームビデオ
10. 観光化された記憶 — 懐古・レトロの商品化、観光資源化
11. 手仕事・身体技術 — 農作業、町工場、台所の手仕事
12. その他

### 3. Recombine（意味の束）

動画を単なるコンテンツではなく、生活文化の断片・民俗資料として読み替える。

### 4. Question（問い）

この記録が未来に投げかける問いを生成する。

### スコアリング（Vanishing Life Score: 0–35）

| 軸 | 説明 |
|----|------|
| 場所の消失度 | 廃校・閉店・廃線など |
| 生活技術の希少性 | 手仕事・台所・農作業など |
| 世代記憶の濃さ | 祖父母・実家・帰省など |
| 地域性 | ローカルな文脈 |
| 個人記録性 | ホームビデオ的アーカイブ性 |
| 商業演出の少なさ | vlog 商法との距離 |
| 追悼・別れの気配 | 最後の日・解体前など |

---

## 人間によるキュレーション（観測台帳）

### curationStatus

各 Video には人間の選別状態 `curationStatus` があります。デフォルトは `unreviewed`（未選別）です。

| 値 | 意味 |
|----|------|
| `unreviewed` | 未選別 — まだ人間が見ていない |
| `keep` | 保存 — 観測台帳に残す |
| `ignore` | 除外 — ノイズ、対象外 |
| `later` | 後で — あとで再検討 |
| `article_candidate` | 記事化候補 — book.shiroand.io 等への記事素材 |
| `meaning_layer_candidate` | Meaning Layer 候補 — 意味層へ送る断片 |

Videos 一覧・詳細ページの控えめなボタンから更新できます。

### Human Note（観測者メモ）

Video Detail ページの **観測者メモ / Human Note** 欄に、人間の観測・選別・意味づけを記録します。

- AI の Field Note とは明確に分離
- textarea で編集、保存ボタンで SQLite に保存
- Home の Article Candidates に短く表示される

### Article Candidate

LLM 分析時に `articleAngle`（記事の切り口）と `articleTitleCandidates`（タイトル案3つ）を生成します。  
人間が Videos ページで **Article** ボタンを押すと `article_candidate` になり、Home に最大 5 件表示されます。

記事化ワークフロー:

1. AI が Field Note + 記事案を生成
2. 人間が Human Note で補足・修正
3. Article ボタンで候補化
4. Home の Article Candidates から詳細へ

### Meaning Layer Candidate

**Meaning Layer** ボタンで `meaning_layer_candidate` に設定。  
将来 Meaning Layer へ export する候補として Home に最大 5 件表示されます。

将来 Meaning Layer へ export する候補として Home に最大 5 件表示されます。

---

## Article Studio

複数の Article Candidate を束ね、book.shiroand.io に掲載できる記事の種を生成する作業机です。

### 使い方

1. **Videos** で記事化したい動画に **Article** ボタンを押す（`article_candidate` になる）
2. **Article Studio**（`/article-studio`）を開く
3. checkbox で複数の生活断片を選択
4. **「記事案を生成」** をクリック
5. 生成された **Article Draft** の詳細ページで編集
6. **Markdown Export** で `.md` をダウンロード → book.shiroand.io へ

OpenAI API キーが未設定の場合は mock 記事案が生成されます。

### ArticleDraft モデル

| フィールド | 説明 |
|-----------|------|
| title, subtitle | 記事タイトル |
| theme, angle | テーマと切り口 |
| lead | 導入文 |
| outlineJson | 見出し構成（JSON） |
| bodyDraft | 本文下書き |
| selectedVideoIdsJson | 元になった動画 ID 一覧 |
| questionsJson | 記事が投げかける問い |
| tagsJson | タグ |
| status | draft / selected / exported |
| titleCandidatesJson | 再生成したタイトル案（JSON） |
| linkedinPost | LinkedIn告知文 |
| noteIntro | note向け導入文 |

### ArticleRevision モデル

| フィールド | 説明 |
|-----------|------|
| articleDraftId | 対象 Draft |
| actionType | 実行した編集ツール |
| beforeJson | 変更前スナップショット |
| afterJson | 変更後スナップショット |
| createdAt | 実行日時 |

### Markdown Export

Article Draft 詳細ページの **Markdown Export** ボタン、または:

```
GET /api/article-drafts/:id/export
```

book.shiroand.io 向けの Markdown 形式でダウンロードできます。

### Editorial Tools（Rewrite）

Article Draft 詳細ページの編集欄の下に、観測文を整えるための編集ツールがあります。

| ツール | 説明 |
|--------|------|
| 観測文に整える | book.shiroand.io向けの静かな観測文へ |
| 具体から書き直す | 映像描写から始める本文へ |
| 煽りを弱める | 説明口調・抽象表現を減らす |
| 思想文に寄せる | SHIRO & Co. の思想を自然に織り込む |
| book.shiroand.io向けに整える | 公開向けフォーマットに調整 |
| タイトル案を再生成 | 5種類のタイトル案 |
| Outlineを再生成 | 3〜6個の見出し構成 |
| LinkedIn告知文を作る | 300〜500字の投稿文 |
| note向け導入文を作る | 500〜800字の冒頭 |

各ツール実行時、変更前後のスナップショットは **ArticleRevision** に保存されます。

```
POST /api/article-drafts/:id/editorial
{ "actionType": "observe_tone" }
```

`actionType`: `observe_tone` | `ideological` | `concrete_rewrite` | `reduce_hype` | `regenerate_titles` | `regenerate_outline` | `book_format` | `linkedin_post` | `note_intro`

---

## Clusters — 消失シグナルの束

複数の生活断片を意味のまとまりとして束ね、繰り返し現れる消失シグナルを発見する機能です。

### 使い方

1. **Video Detail** で動画を Cluster に追加（Note 付き可）
2. **Clusters**（`/clusters`）で束ねた断片を確認
3. **Cluster Summaryを生成** で共通する消失シグナルを LLM 要約
4. **Article Studio** で Cluster からまとめて記事案を生成
5. Editorial Tools → Markdown Export → book.shiroand.io

### 初期 Cluster（5件）

- 地域の葬送
- 家庭内民俗
- 生活インフラの記憶装置化
- 失われる移動感覚
- 昭和・平成の生活記憶

### Cluster モデル

| フィールド | 説明 |
|-----------|------|
| title, description, theme, question | 束の名称と観測の問い |
| tagsJson | タグ |
| summary, articleAnglesJson, generatedQuestionsJson, recommendedTitle | Summary 生成結果 |

### ClusterItem モデル

| フィールド | 説明 |
|-----------|------|
| clusterId, videoId | 多対多の関連 |
| note | この動画が Cluster に属する理由 |

---

## API Routes

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/seeds` | Seed Keyword 一覧（初回自動 seed） |
| POST | `/api/seeds` | 追加 |
| DELETE | `/api/seeds/:id` | 削除 |
| PATCH | `/api/seeds/:id` | 有効/無効切替 |
| POST | `/api/youtube/search` | キーワード検索 |
| POST | `/api/youtube/search-all` | 全 active seed で検索 |
| GET | `/api/videos` | 動画一覧（curationStatus 等フィルター可） |
| GET | `/api/videos/:id` | 動画詳細 |
| PATCH | `/api/videos/:id/curation` | キュレーション状態更新 |
| PATCH | `/api/videos/:id/note` | Human Note 保存 |
| PATCH | `/api/videos/:id/public-note` | Public Note 保存 |
| PATCH | `/api/videos/:id/publish` | Video publishStatus 更新 |
| PATCH | `/api/analysis/:id/publish` | Field Note publishStatus 更新 |
| POST | `/api/analyze/:videoId` | 1 件分析 |
| POST | `/api/analyze-unprocessed` | 未分析を一括分析 |
| POST | `/api/article-studio/generate` | 選択動画から記事案生成 |
| GET | `/api/article-candidates` | 記事化候補一覧 |
| GET | `/api/article-drafts` | Article Draft 一覧 |
| GET | `/api/article-drafts/:id` | Article Draft 詳細 |
| PATCH | `/api/article-drafts/:id` | Article Draft 更新 |
| GET | `/api/article-drafts/:id/export` | Markdown ダウンロード |
| POST | `/api/article-drafts/:id/editorial` | Editorial Tools 実行 |
| PATCH | `/api/article-drafts/:id/publish` | Article Draft publishStatus 更新 |
| PATCH | `/api/clusters/:id/publish` | Cluster publishStatus 更新 |
| GET | `/api/export/bundle` | Public Bundle JSON |
| GET | `/api/export/markdown` | Public Markdown Export |
| GET | `/api/export/queue` | public_ready キュー一覧 |
| GET | `/api/clusters` | Cluster 一覧 |
| GET | `/api/clusters/:id` | Cluster 詳細 |
| POST | `/api/clusters/:id/summary` | Cluster Summary 生成 |
| POST | `/api/clusters/:id/items` | 動画を Cluster に追加 |
| GET | `/api/clusters/:id/videos` | Cluster 所属動画（Article Studio 用） |
| PATCH/DELETE | `/api/cluster-items/:id` | ClusterItem note 更新 / 削除 |
| GET | `/api/videos/:id/clusters` | 動画の Cluster 所属一覧 |
| GET | `/api/stats` | ダッシュボード統計 |
| POST | `/api/mock/import` | Mock データ投入 |

---

## 今後の拡張案

- TikTok / Instagram Reels / Vimeo / Internet Archive 対応
- コメント欄の深掘り分析
- サムネイル Vision 分析
- 地名抽出・地図表示
- 年代別タイムライン
- book.shiroand.io への Field Note export
- Markdown / JSON export、RSS 生成
- Meaning Layer との連携（候補選別 UI 実装済み → export 待ち）
- 手動キュレーション、人間による解釈追記（Human Note 実装済み）
- Vercel + Supabase（PostgreSQL）への移行

---

## ディレクトリ構成

```
vanishing-life-archive/
├── prisma/
│   ├── schema.prisma      # SeedKeyword, Video, Analysis
│   ├── seed.ts            # 初期キーワード
│   └── migrations/
├── src/
│   ├── app/               # ページ & API Routes
│   ├── components/
│   └── lib/
│       ├── prisma.ts
│       ├── youtube.ts
│       ├── openai.ts
│       ├── mock-data.ts
│       ├── videos.ts
│       └── stats.ts
└── README.md
```

---

## ライセンス

SHIRO & Co. 内部 MVP。用途に応じてライセンスを設定してください。
