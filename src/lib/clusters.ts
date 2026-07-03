import OpenAI from "openai";
import { prisma } from "./prisma";
import { INITIAL_CLUSTERS } from "./cluster-seed";
import {
  CLUSTER_CANDIDATE_RULES,
  scoreVideoForCluster,
  type VideoForMatching,
} from "./cluster-candidates";
import { serializeVideo } from "./videos";
import type {
  ClusterSummaryResult,
  ClusterVideoSource,
  ClusterWithItems,
  SerializedCluster,
  SerializedClusterVideo,
} from "./cluster-types";
import type { Cluster } from "@/generated/prisma/client";

function parseJsonArray<T>(json: string | null | undefined, fallback: T[] = []): T[] {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function excerpt(text: string, max = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max) + "…";
}

export async function seedInitialClusters() {
  for (const cluster of INITIAL_CLUSTERS) {
    const existing = await prisma.cluster.findFirst({
      where: { title: cluster.title },
    });
    if (existing) continue;

    await prisma.cluster.create({
      data: {
        title: cluster.title,
        description: cluster.description,
        theme: cluster.theme,
        question: cluster.question,
        tagsJson: JSON.stringify(cluster.tags),
      },
    });
  }
}

export function serializeClusterVideo(
  video: ClusterVideoSource
): SerializedClusterVideo {
  const human = video.humanNote?.trim() || null;
  return {
    id: video.id,
    sourceTitle: video.title,
    thumbnailUrl: video.thumbnailUrl ?? "",
    seedKeyword: video.seedKeyword ?? "",
    fieldNoteTitle: video.analysis?.fieldNoteTitle ?? null,
    articleAngle: video.analysis?.articleAngle ?? null,
    category: video.analysis?.category ?? "—",
    vanishingLifeScore: video.analysis?.vanishingLifeScore ?? 0,
    humanNote: human,
    humanNoteExcerpt: human ? excerpt(human) : null,
    tags: parseJsonArray<string>(video.analysis?.tagsJson),
    curationStatus: video.curationStatus,
  };
}

function videoToMatchInput(
  video: {
    id: number;
    title: string;
    description: string;
    humanNote: string | null;
    analysis: {
      category: string;
      fieldNoteTitle: string;
      fieldNote: string;
      vanishingLifeScore: number;
      tagsJson: string;
    } | null;
  }
): VideoForMatching | null {
  if (!video.analysis) return null;

  let analysisTags: string[] = [];
  try {
    analysisTags = JSON.parse(video.analysis.tagsJson) as string[];
  } catch {
    analysisTags = [];
  }

  return {
    id: video.id,
    title: video.title,
    description: video.description,
    category: video.analysis.category,
    analysisTags,
    fieldNoteTitle: video.analysis.fieldNoteTitle,
    fieldNote: video.analysis.fieldNote,
    humanNote: video.humanNote,
    vanishingLifeScore: video.analysis.vanishingLifeScore,
  };
}

async function attachCandidateCounts(
  clusters: SerializedCluster[]
): Promise<SerializedCluster[]> {
  if (clusters.length === 0) return clusters;

  const [videos, items] = await Promise.all([
    prisma.video.findMany({ include: { analysis: true } }),
    prisma.clusterItem.findMany({
      select: { clusterId: true, videoId: true },
    }),
  ]);

  const membersByCluster = new Map<number, Set<number>>();
  for (const item of items) {
    const set = membersByCluster.get(item.clusterId) ?? new Set<number>();
    set.add(item.videoId);
    membersByCluster.set(item.clusterId, set);
  }

  return clusters.map((cluster) => {
    const rule = CLUSTER_CANDIDATE_RULES[cluster.title];
    if (!rule) return { ...cluster, candidateCount: 0 };

    const memberIds = membersByCluster.get(cluster.id) ?? new Set<number>();
    let candidateCount = 0;

    for (const video of videos) {
      if (memberIds.has(video.id)) continue;
      const input = videoToMatchInput(video);
      if (!input) continue;
      if (scoreVideoForCluster(input, rule) > 0) candidateCount++;
    }

    return { ...cluster, candidateCount };
  });
}

export function serializeCluster(
  cluster: Cluster & { _count?: { items: number }; items?: ClusterWithItems["items"] }
): SerializedCluster {
  return {
    id: cluster.id,
    title: cluster.title,
    description: cluster.description,
    theme: cluster.theme,
    question: cluster.question,
    tags: parseJsonArray<string>(cluster.tagsJson),
    summary: cluster.summary,
    hypothesis: cluster.hypothesis ?? null,
    articleAngles: parseJsonArray<string>(cluster.articleAnglesJson),
    generatedQuestions: parseJsonArray<string>(cluster.generatedQuestionsJson),
    recommendedTitle: cluster.recommendedTitle,
    publishStatus: cluster.publishStatus,
    itemCount: cluster._count?.items ?? cluster.items?.length ?? 0,
    candidateCount: 0,
    createdAt: cluster.createdAt.toISOString(),
    updatedAt: cluster.updatedAt.toISOString(),
    items: cluster.items?.map((item) => ({
      id: item.id,
      clusterId: item.clusterId,
      videoId: item.videoId,
      note: item.note,
      createdAt: item.createdAt.toISOString(),
      video: serializeClusterVideo(item.video),
    })),
  };
}

export async function getClusters(limit?: number) {
  await seedInitialClusters();
  const clusters = await prisma.cluster.findMany({
    orderBy: { title: "asc" },
    take: limit,
    include: { _count: { select: { items: true } } },
  });
  return attachCandidateCounts(clusters.map(serializeCluster));
}

export async function getClusterById(id: number) {
  await seedInitialClusters();
  const cluster = await prisma.cluster.findUnique({
    where: { id },
    include: {
      _count: { select: { items: true } },
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          video: {
            include: { analysis: true },
          },
        },
      },
    },
  });
  if (!cluster) return null;
  const serialized = serializeCluster(cluster as ClusterWithItems);
  const [withCounts] = await attachCandidateCounts([serialized]);
  return withCounts;
}

export async function getVideoClusters(videoId: number) {
  await seedInitialClusters();
  const items = await prisma.clusterItem.findMany({
    where: { videoId },
    include: {
      cluster: { include: { _count: { select: { items: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return items.map((item) => ({
    itemId: item.id,
    note: item.note,
    cluster: serializeCluster(item.cluster),
  }));
}

export async function addVideoToCluster(
  clusterId: number,
  videoId: number,
  note?: string
) {
  const item = await prisma.clusterItem.upsert({
    where: { clusterId_videoId: { clusterId, videoId } },
    create: { clusterId, videoId, note: note || null },
    update: note !== undefined ? { note: note || null } : {},
  });
  return item;
}

export async function removeVideoFromCluster(itemId: number) {
  await prisma.clusterItem.delete({ where: { id: itemId } });
}

export async function updateClusterItemNote(itemId: number, note: string) {
  return prisma.clusterItem.update({
    where: { id: itemId },
    data: { note: note || null },
  });
}

export async function getClusterVideoIds(clusterId: number): Promise<number[]> {
  const items = await prisma.clusterItem.findMany({
    where: { clusterId },
    select: { videoId: true },
  });
  return items.map((i) => i.videoId);
}

const CLUSTER_SUMMARY_PROMPT = `あなたはSHIRO & Co.のBoundary Designerです。

以下のClusterに含まれる複数の生活動画のField Note、Kosuke Protocol Analysis、Human Noteを読み、そこに共通する消失シグナルを抽出してください。

これは動画紹介ではありません。
複数の動画を通して、生活文化のどの部分が消えつつあるのか、それがどのように記録されているのか、人はなぜそれを撮るのかを考えるための観測です。

重要：

- このCluster Summaryは、抽象的なカテゴリ説明ではなく、実際に所属している動画群から読み取れる観測要約である
- まず、所属動画に共通している具体的な生活断片を述べる
- その後に、共通する消失シグナルを抽出する
- 動画が少ない場合は「現時点では仮説」と明記する
- 動画を見ていない場合は、メタデータ、Field Note、Human Noteから読み取れる範囲に限定する
- 不明なことは断定しない
- 抽象化しすぎない
- 生活の具体、場所、道具、手の動き、移動、時間感覚を重視する
- 「懐かしい」「エモい」だけで終わらせない
- 出力はJSONのみ

出力：
{
  "summary": "観測要約 — 所属動画に共通する具体的な生活断片から始める",
  "hypothesis": "現時点の仮説 — 動画が少ない場合はその旨を含める",
  "articleAngles": [],
  "questions": [],
  "recommendedTitle": ""
}`;

function buildClusterLlmInput(cluster: SerializedCluster) {
  return {
    title: cluster.title,
    description: cluster.description,
    theme: cluster.theme,
    question: cluster.question,
    tags: cluster.tags,
    videos: (cluster.items ?? []).map((item) => ({
      sourceTitle: item.video?.sourceTitle,
      fieldNoteTitle: item.video?.fieldNoteTitle,
      articleAngle: item.video?.articleAngle,
      category: item.video?.category,
      vanishingLifeScore: item.video?.vanishingLifeScore,
      humanNote: item.video?.humanNote,
      clusterNote: item.note,
    })),
  };
}

function mockClusterSummary(cluster: SerializedCluster): ClusterSummaryResult {
  const videoTitles = (cluster.items ?? [])
    .map((item) => item.video?.fieldNoteTitle ?? item.video?.sourceTitle)
    .filter(Boolean)
    .slice(0, 3);

  const hypothesisPrefix =
    cluster.itemCount <= 2 ? "現時点では仮説 — " : "";

  return {
    summary: `所属する${cluster.itemCount}件の生活断片（${videoTitles.join("、")}など）から、${cluster.title}に共通する消失シグナルが見える。`,
    hypothesis: `${hypothesisPrefix}${cluster.question}`,
    articleAngles: [
      `${cluster.title}として読む — ${cluster.theme}`,
      "個人記録が民俗資料になる条件",
      "プラットフォーム上に残された生活文化の断片",
    ],
    questions: [
      cluster.question,
      "誰が、名もない生活にメタデータを付けるのか。",
      "book.shiroand.ioに渡すべき記事は、どの消失シグナルから始まるべきか。",
    ],
    recommendedTitle: `${cluster.title} — ${cluster.theme}`,
  };
}

export async function generateClusterSummary(
  clusterId: number,
  useMock = false
): Promise<{ result: ClusterSummaryResult; cluster: SerializedCluster }> {
  const cluster = await getClusterById(clusterId);
  if (!cluster) throw new Error("Cluster not found");

  const itemCount = cluster.items?.length ?? cluster.itemCount;
  if (itemCount === 0) {
    throw new Error(
      "Cluster Summary requires at least one video. Add observations to this cluster first."
    );
  }

  let result: ClusterSummaryResult;

  if (useMock || !process.env.OPENAI_API_KEY?.trim()) {
    result = mockClusterSummary(cluster);
  } else {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: CLUSTER_SUMMARY_PROMPT },
        {
          role: "user",
          content: `入力：\n${JSON.stringify(buildClusterLlmInput(cluster), null, 2)}`,
        },
      ],
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned empty response");
    result = JSON.parse(content) as ClusterSummaryResult;
  }

  const updated = await prisma.cluster.update({
    where: { id: clusterId },
    data: {
      summary: result.summary,
      hypothesis: result.hypothesis ?? null,
      articleAnglesJson: JSON.stringify(result.articleAngles),
      generatedQuestionsJson: JSON.stringify(result.questions),
      recommendedTitle: result.recommendedTitle,
    },
    include: { _count: { select: { items: true } } },
  });

  return {
    result,
    cluster: serializeCluster(updated),
  };
}

export async function getClusterCandidateVideos(
  clusterId: number,
  limit = 20
): Promise<SerializedClusterVideo[]> {
  const cluster = await getClusterById(clusterId);
  if (!cluster) return [];

  const rule = CLUSTER_CANDIDATE_RULES[cluster.title];
  if (!rule) return [];

  const memberIds = new Set((cluster.items ?? []).map((i) => i.videoId));

  const videos = await prisma.video.findMany({
    include: { analysis: true },
    orderBy: { updatedAt: "desc" },
  });

  const scored = videos
    .filter((v) => !memberIds.has(v.id))
    .map((v) => {
      const input = videoToMatchInput(v);
      if (!input) return { score: 0, video: v };
      return {
        score: scoreVideoForCluster(input, rule),
        video: v,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ video }) =>
    serializeClusterVideo({
      id: video.id,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      seedKeyword: video.seedKeyword,
      humanNote: video.humanNote,
      curationStatus: video.curationStatus,
      analysis: video.analysis
        ? {
            fieldNoteTitle: video.analysis.fieldNoteTitle,
            fieldNote: video.analysis.fieldNote,
            articleAngle: video.analysis.articleAngle,
            category: video.analysis.category,
            vanishingLifeScore: video.analysis.vanishingLifeScore,
            tagsJson: video.analysis.tagsJson,
          }
        : null,
    })
  );
}

export async function getVideosForArticleStudioFromCluster(clusterId: number) {
  const cluster = await getClusterById(clusterId);
  if (!cluster) return null;

  let videoIds = (cluster.items ?? []).map((i) => i.videoId);

  if (videoIds.length === 0) {
    const candidates = await getClusterCandidateVideos(clusterId, 20);
    videoIds = candidates.map((c) => c.id);
  }

  if (videoIds.length === 0) return [];

  const videos = await prisma.video.findMany({
    where: { id: { in: videoIds } },
    include: { analysis: true },
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
