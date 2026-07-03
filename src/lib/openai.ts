import OpenAI from "openai";
import { CATEGORIES } from "./constants";
import type { AnalysisResult, YouTubeSearchResult } from "./types";

const ANALYSIS_PROMPT = `あなたは、SHIRO & Co. のBoundary Designerです。
あなたの仕事は、YouTube上の動画メタデータを、生活文化の消失、地域の記憶、民俗的断片、個人アーカイブとして読み解くことです。

この動画を、Kosuke Protocolに基づいて分析してください。

Kosuke Protocol:

1. Observe
   何が記録されているか。タイトル、説明文、チャンネル名、投稿日、統計情報から観測できることを書く。

2. Sample
   それがどの生活文化の断片に属するか分類する。

3. Recombine
   その動画を単なる動画ではなく、生活の意味、消えゆく習慣、地域の記憶、家族の記録、プラットフォーム上の民俗資料として読み替える。

4. Question
   この動画が未来に向けて投げかける問いを書く。

評価軸：

* 場所の消失度
* 生活技術の希少性
* 世代記憶の濃さ
* 地域性
* 個人記録性
* 商業演出の少なさ
* 追悼・別れの気配

追加の分析指示：

* 「懐かしい」「レトロ」という言葉だけで分析を終えない。
* かつて日常だったものが、現在どのように記録化・観光化・展示化・商品化されているかを見る。
* 動画を見ていない場合は、メタデータから読み取れる範囲に限定する。
* 不明なことは断定しない。
* ただし、意味の仮説は出してよい。
* レトロ自販機、純喫茶、古民家、団地、商店街などは、単なる懐古ではなく「生活インフラが記憶装置に変わる過程」として扱う。
* 閉店、廃線、廃校、取り壊し、最後の日は「地域の葬送」として扱う可能性を検討する。
* 祖父母の家、実家、帰省、台所、ホームビデオは「家庭内民俗」として扱う可能性を検討する。

注意：

* 大げさにしすぎない。
* 文章は日本語。
* Field Noteは400〜800字程度。
* 出力は必ずJSONのみ。
* Markdownは使わない。

category は次のいずれか1つ: ${CATEGORIES.join(" | ")}

vanishingLifeScore は7つの評価軸の合計（各0-5、合計0-35）。

記事化候補：
記事化できそうな場合のみ、articleAngle と articleTitleCandidates を生成する。
記事化の余地が薄い場合は articleAngle を null、articleTitleCandidates を null にする。

出力JSON形式：

{
"category": "",
"vanishingLifeScore": 0,
"scores": {
"placeDisappearance": 0,
"lifeTechniqueRarity": 0,
"generationalMemory": 0,
"locality": 0,
"personalArchiveQuality": 0,
"lowCommercialization": 0,
"mourningOrFarewellTone": 0
},
"observe": "",
"sample": "",
"recombine": "",
"question": "",
"fieldNoteTitle": "",
"fieldNote": "",
"tags": [],
"articleAngle": null,
"articleTitleCandidates": null
}`;

export function hasOpenAiApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function buildInputPayload(
  video: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string | Date;
    seedKeyword: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
  },
  tags: string[],
  comments: string[]
) {
  return {
    title: video.title,
    description: video.description,
    channelTitle: video.channelTitle,
    publishedAt:
      video.publishedAt instanceof Date
        ? video.publishedAt.toISOString()
        : video.publishedAt,
    seedKeyword: video.seedKeyword,
    statistics: {
      viewCount: video.viewCount,
      likeCount: video.likeCount,
      commentCount: video.commentCount,
    },
    tags,
    comments,
  };
}

export async function analyzeVideoMetadata(
  video: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string | Date;
    seedKeyword: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
  },
  tags: string[] = [],
  comments: string[] = []
): Promise<{ result: AnalysisResult; model: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({ apiKey });
  const model = "gpt-4o-mini";
  const input = buildInputPayload(video, tags, comments);

  const response = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: ANALYSIS_PROMPT },
      {
        role: "user",
        content: `入力データ：\n${JSON.stringify(input, null, 2)}`,
      },
    ],
    temperature: 0.4,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned empty response");
  }

  const parsed = JSON.parse(content) as AnalysisResult;
  const scoreSum = Object.values(parsed.scores).reduce((a, b) => a + b, 0);
  parsed.vanishingLifeScore = scoreSum;

  return { result: parsed, model };
}

export function analyzeVideoMetadataMock(
  video: {
    title: string;
    description: string;
    channelTitle: string;
    seedKeyword: string;
  }
): { result: AnalysisResult; model: string } {
  const scores = {
    placeDisappearance: 3,
    lifeTechniqueRarity: 2,
    generationalMemory: 4,
    locality: 3,
    personalArchiveQuality: 4,
    lowCommercialization: 3,
    mourningOrFarewellTone: 3,
  };

  const result: AnalysisResult = {
    category: "家族記録",
    vanishingLifeScore: Object.values(scores).reduce((a, b) => a + b, 0),
    scores,
    observe: `「${video.title}」は${video.channelTitle}による投稿。Seed Keyword「${video.seedKeyword}」経由で観測。説明文から、個人的な記録意図が読み取れる。`,
    sample: "家族記録と地域記憶の境界に位置する生活断片。個人チャンネルによる記録映像。",
    recombine:
      "この動画はエンターテインメントではなく、名もなき生活を未来へ渡す民俗資料の断片として機能している可能性がある。",
    question: "なぜ人は、消える直前に撮り始めるのか。",
    fieldNoteTitle: `${video.title} — 観測メモ`,
    fieldNote: `この記録は、YouTube上に残された生活文化の断片である。タイトルと説明文から、撮影者は特定の場所・時間・関係性を保存しようとしていることがうかがえる。チャンネル名「${video.channelTitle}」は個人または小規模な発信主体を示唆する。Seed Keyword「${video.seedKeyword}」は、消失シグナルとの関連を示す観測経路である。動画本体は未視聴のため、ここではメタデータに基づく仮説に留める。`,
    tags: ["mock", "生活断片", video.seedKeyword],
    articleAngle: "個人記録が民俗資料になる条件",
    articleTitleCandidates: [
      `${video.title}から見る、家庭内民俗の断片`,
      "名もなき生活記録は、誰の資料になるのか",
      "消える直前に撮られはじめる生活",
    ],
  };

  return { result, model: "mock-analyzer" };
}

export function extractTagsFromRaw(rawJson: string): string[] {
  try {
    const raw = JSON.parse(rawJson) as {
      detail?: { snippet?: { tags?: string[] } };
      tags?: string[];
    };
    return raw.detail?.snippet?.tags ?? raw.tags ?? [];
  } catch {
    return [];
  }
}

export function extractCommentsFromRaw(rawJson: string): string[] {
  try {
    const raw = JSON.parse(rawJson) as { comments?: string[] };
    return raw.comments ?? [];
  } catch {
    return [];
  }
}

export function mergeRawWithSearchResult(result: YouTubeSearchResult): string {
  return JSON.stringify({
    ...result.rawJson,
    tags: result.tags,
    comments: result.comments,
  });
}
