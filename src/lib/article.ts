import OpenAI from "openai";
import { prisma } from "./prisma";
import { serializeVideo } from "./videos";
import type {
  ArticleCandidateVideo,
  ArticleGenerationResult,
  ArticleOutlineItem,
  SerializedArticleDraft,
  TitleCandidate,
} from "./article-types";
import type { ArticleDraft } from "@/generated/prisma/client";

const ARTICLE_PROMPT = `あなたは、SHIRO & Co. のBoundary Designerであり、生活文化の観測者です。

あなたの仕事は、複数のYouTube動画のField Note、Human Note、Kosuke Protocol Analysisを読み、そこに共通する生活文化の変化、消失の気配、地域や家庭に残る未制度化の知識を見つけ、book.shiroand.ioに掲載できる記事案を作ることです。

これはSEO記事ではありません。
動画紹介記事でもありません。
生活がどのように消え、どのように記録され、どのようにプラットフォーム上で意味づけられていくのかを観測する文章です。

重要な視点：

- 生活は、消える直前に撮られはじめる。
- スマホ動画は、未来の民俗資料館になる。
- 家庭内の手仕事は、レシピではなく身体技術として残る。
- 台所、実家、商店街、銭湯、団地、ローカル線、古民家は、単なる場所ではなく生活のOSである。
- 閉店、廃校、廃線、取り壊し、最後の日は、地域の葬送として記録される。
- レトロ化されたものは、かつての日常が観光化・展示化・商品化された姿でもある。
- AIは動画を完全には理解しない。人間のHuman Noteと組み合わせて、意味の仮説を作る。

注意：

- 動画を実際に見ていない場合は、メタデータとField Noteから読み取れる範囲に限定する。
- 不明なことを断定しない。
- 大げさにしすぎない。
- 「懐かしい」「エモい」だけで終わらせない。
- 静かな観測文として書く。
- Kosuke Protocolの言葉を本文に自然に使ってよい。
- outlineは必ず3〜6個の見出しを含める。各見出しには heading と summary を付ける。
- 出力はJSONのみ。
- Markdownは使わない。

出力JSON：
{
  "title": "",
  "subtitle": "",
  "theme": "",
  "angle": "",
  "lead": "",
  "outline": [],
  "bodyDraft": "",
  "questions": [],
  "tags": []
}`;

function parseJsonArray<T>(json: string, fallback: T[] = []): T[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

const DEFAULT_OUTLINE: ArticleOutlineItem[] = [
  {
    heading: "観測 — 何が記録されているか",
    summary: "動画に映る生活の断片と、その記録のタイミング",
  },
  {
    heading: "分類 — どの生活文化の断片か",
    summary: "Field Noteから読み取れるカテゴリと消失シグナル",
  },
  {
    heading: "意味の束 — 単なる動画を超えて",
    summary: "複数の観測を束ねて見える共通テーマ",
  },
  {
    heading: "問い — 未来へ投げかけること",
    summary: "記録の先に残る民俗資料としての可能性",
  },
];

export function normalizeOutline(
  outline: ArticleOutlineItem[],
  fallbackTheme?: string
): ArticleOutlineItem[] {
  const valid = outline.filter((o) => o?.heading?.trim());
  if (valid.length >= 3) return valid.slice(0, 6);

  const themeHint = fallbackTheme?.trim();
  const base = valid.length > 0 ? valid : DEFAULT_OUTLINE;
  const padded = [...base];
  while (padded.length < 3) {
    padded.push({
      ...DEFAULT_OUTLINE[padded.length % DEFAULT_OUTLINE.length],
    });
  }
  if (themeHint && padded[0]) {
    padded[0] = {
      ...padded[0],
      summary: themeHint.slice(0, 120) + (padded[0].summary ? ` — ${padded[0].summary}` : ""),
    };
  }
  return padded.slice(0, 6);
}

export function serializeArticleDraft(
  draft: ArticleDraft,
  selectedVideos?: Array<{ id: number; title: string; url: string; channelTitle: string }>
): SerializedArticleDraft {
  return {
    id: draft.id,
    title: draft.title,
    subtitle: draft.subtitle,
    theme: draft.theme,
    angle: draft.angle,
    lead: draft.lead,
    outline: parseJsonArray<ArticleOutlineItem>(draft.outlineJson),
    selectedVideoIds: parseJsonArray<number>(draft.selectedVideoIdsJson),
    bodyDraft: draft.bodyDraft,
    questions: parseJsonArray<string>(draft.questionsJson),
    tags: parseJsonArray<string>(draft.tagsJson),
    titleCandidates: draft.titleCandidatesJson
      ? parseJsonArray<TitleCandidate>(draft.titleCandidatesJson)
      : [],
    linkedinPost: draft.linkedinPost ?? null,
    noteIntro: draft.noteIntro ?? null,
    status: draft.status,
    publishStatus: draft.publishStatus,
    createdAt: draft.createdAt.toISOString(),
    updatedAt: draft.updatedAt.toISOString(),
    selectedVideos,
  };
}

export async function getArticleCandidates(): Promise<ArticleCandidateVideo[]> {
  const videos = await prisma.video.findMany({
    where: { curationStatus: "article_candidate" },
    include: { analysis: true },
    orderBy: { updatedAt: "desc" },
  });

  return videos.map((v) => {
    const s = serializeVideo(v);
    return {
      id: s.id,
      videoId: s.videoId,
      url: s.url,
      title: s.title,
      description: s.description,
      channelTitle: s.channelTitle,
      thumbnailUrl: s.thumbnailUrl,
      category: s.analysis?.category ?? "—",
      vanishingLifeScore: s.analysis?.vanishingLifeScore ?? 0,
      fieldNoteTitle: s.analysis?.fieldNoteTitle ?? s.title,
      articleAngle: s.analysis?.articleAngle ?? null,
      humanNotePreview: s.humanNote
        ? s.humanNote.slice(0, 120) + (s.humanNote.length > 120 ? "…" : "")
        : null,
    };
  });
}

function buildSelectedVideosPayload(videoIds: number[]) {
  return prisma.video.findMany({
    where: { id: { in: videoIds } },
    include: { analysis: true },
  });
}

export function buildLlmInputFromVideos(
  videos: Awaited<ReturnType<typeof buildSelectedVideosPayload>>
) {
  return videos.map((v) => {
    const s = serializeVideo(v);
    return {
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.analysis?.category,
      observe: s.analysis?.observe,
      sample: s.analysis?.sample,
      recombine: s.analysis?.recombine,
      question: s.analysis?.question,
      fieldNoteTitle: s.analysis?.fieldNoteTitle,
      fieldNote: s.analysis?.fieldNote,
      articleAngle: s.analysis?.articleAngle,
      articleTitleCandidates: s.analysis?.articleTitleCandidates,
      humanNote: s.humanNote,
      tags: s.analysis?.tags,
      vanishingLifeScore: s.analysis?.vanishingLifeScore,
    };
  });
}

export function generateArticleMock(
  videos: Awaited<ReturnType<typeof buildSelectedVideosPayload>>
): ArticleGenerationResult {
  const titles = videos.map((v) => v.title).slice(0, 3);
  const categories = [
    ...new Set(
      videos
        .map((v) => v.analysis?.category)
        .filter(Boolean) as string[]
    ),
  ];

  return {
    title: "消える直前に撮られはじめる生活 — 観測から見える共通テーマ",
    subtitle: `${videos.length}つの生活断片から見えた消失シグナル`,
    theme: "プラットフォーム上に残された生活記録が、未来の民俗資料になる過程",
    angle: `「${categories.join("」「")}」に共通する、記録化と意味づけのタイミング`,
    lead: `YouTube上には、名もない人々が撮り始めた生活の断片が大量にある。${titles.join("、")}——これらは単なる動画ではない。消える直前、あるいは消えたあとに、記録として残された生活文化の断片である。本稿では、Kosuke Protocolで観測した${videos.length}件のField Noteを束ね、共通する消失シグナルと意味の束を読み取る。`,
    outline: [
      {
        heading: "生活は、消える直前に撮られはじめる",
        summary: "閉店・廃校・解体前など、消失の直前に記録が始まるパターン",
      },
      {
        heading: "スマホ動画は民俗資料館の断片",
        summary: "公式資料に残らない日常の質感が、個人チャンネルに保存される",
      },
      {
        heading: "Human Noteが加える意味の層",
        summary: "AI分析と人間の観測メモが交差する地点",
      },
    ],
    bodyDraft: `## 観測のはじまり\n\nVanishing Life Archiveは、YouTube上の生活記録を観測する台帳である。今回選ばれた${videos.length}件の動画は、いずれも「article_candidate」として人間の手によって選別された断片だ。\n\n${videos
      .map(
        (v) =>
          `「${v.title}」——${v.analysis?.fieldNoteTitle ?? "Field Note未分析"}。${v.analysis?.recombine ?? ""}`
      )
      .join("\n\n")}\n\n## 共通する消失シグナル\n\nこれらに共通するのは、生活が「まだそこにある」うちに、あるいは消えた直後に、記録が始まることだ。懐かしさの消費ではなく、追悼と保存の境界にある記録である。\n\n## 未来への問い\n\n誰が、名もない生活にメタデータを付けるのか。プラットフォームは生活を保存しているのか、それとも消費しているのか。`,
    questions: [
      "なぜ人は、消える直前に撮り始めるのか。",
      "Field Noteの束ね方は、新しい民俗誌の書き方になりうるか。",
      "book.shiroand.ioに渡すべき記事は、どの消失シグナルから始まるべきか。",
    ],
    tags: ["生活", "民俗", "YouTube", "消失", "Field Note"],
  };
}

export async function generateArticleFromVideos(
  videoIds: number[],
  useMock = false
): Promise<{ result: ArticleGenerationResult; draft: SerializedArticleDraft }> {
  if (videoIds.length === 0) {
    throw new Error("At least one video must be selected");
  }

  const videos = await buildSelectedVideosPayload(videoIds);
  if (videos.length === 0) {
    throw new Error("No videos found for selected IDs");
  }

  const input = buildLlmInputFromVideos(videos);
  let result: ArticleGenerationResult;

  if (useMock || !process.env.OPENAI_API_KEY?.trim()) {
    result = generateArticleMock(videos);
    result.outline = normalizeOutline(result.outline, result.theme);
  } else {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ARTICLE_PROMPT },
        {
          role: "user",
          content: `入力データ：\n${JSON.stringify(input, null, 2)}`,
        },
      ],
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned empty response");
    result = JSON.parse(content) as ArticleGenerationResult;
    result.outline = normalizeOutline(result.outline, result.theme);
  }

  const draft = await prisma.articleDraft.create({
    data: {
      title: result.title,
      subtitle: result.subtitle,
      theme: result.theme,
      angle: result.angle,
      lead: result.lead,
      outlineJson: JSON.stringify(normalizeOutline(result.outline, result.theme)),
      selectedVideoIdsJson: JSON.stringify(videoIds),
      bodyDraft: result.bodyDraft,
      questionsJson: JSON.stringify(result.questions),
      tagsJson: JSON.stringify(result.tags),
      status: "draft",
    },
  });

  const selectedVideos = videos.map((v) => ({
    id: v.id,
    title: v.title,
    url: v.url,
    channelTitle: v.channelTitle,
  }));

  return {
    result,
    draft: serializeArticleDraft(draft, selectedVideos),
  };
}

export async function getArticleDraftById(id: number) {
  const draft = await prisma.articleDraft.findUnique({
    where: { id },
    include: {
      revisions: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  if (!draft) return null;

  const videoIds = parseJsonArray<number>(draft.selectedVideoIdsJson);
  const videos = await prisma.video.findMany({
    where: { id: { in: videoIds } },
    select: { id: true, title: true, url: true, channelTitle: true },
  });

  const serialized = serializeArticleDraft(draft, videos);
  const { getEditorialActionLabel } = await import("./editorial-types");
  serialized.revisions = draft.revisions.map((r) => ({
    id: r.id,
    articleDraftId: r.articleDraftId,
    actionType: r.actionType,
    actionLabel: getEditorialActionLabel(r.actionType),
    createdAt: r.createdAt.toISOString(),
  }));
  return serialized;
}

export async function getArticleDrafts(limit?: number) {
  const drafts = await prisma.articleDraft.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return drafts.map((d) => serializeArticleDraft(d));
}

export async function updateArticleDraft(
  id: number,
  data: {
    title?: string;
    subtitle?: string;
    theme?: string;
    angle?: string;
    lead?: string;
    bodyDraft?: string;
    status?: string;
  }
) {
  const draft = await prisma.articleDraft.update({
    where: { id },
    data,
  });
  return serializeArticleDraft(draft);
}

export function articleDraftToMarkdown(draft: SerializedArticleDraft): string {
  const lines: string[] = [
    `# ${draft.title}`,
    draft.subtitle,
    "",
    `theme: ${draft.theme}`,
    `angle: ${draft.angle}`,
    "",
    draft.lead,
    "",
  ];

  for (const item of draft.outline) {
    lines.push(`## ${item.heading}`, "", item.summary, "");
  }

  lines.push(draft.bodyDraft, "", "## Questions", "");
  for (const q of draft.questions) {
    lines.push(`- ${q}`);
  }

  lines.push("", "## Source Videos", "");
  if (draft.selectedVideos) {
    for (const v of draft.selectedVideos) {
      lines.push(`- ${v.title} / ${v.url}`);
    }
  }

  lines.push("", "## Tags", "", draft.tags.join(", "));

  return lines.join("\n");
}
