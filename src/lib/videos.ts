import { prisma } from "./prisma";
import {
  analyzeVideoMetadataMock,
  extractCommentsFromRaw,
  extractTagsFromRaw,
  mergeRawWithSearchResult,
} from "./openai";
import { MOCK_ANALYSES, MOCK_VIDEOS } from "./mock-data";
import type { AnalysisResult, YouTubeSearchResult, SerializedVideo } from "./types";
import type { CurationStatus } from "./constants";
import type { Video, Analysis } from "@/generated/prisma/client";

function parseArticleTitles(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeVideo(
  video: Video & { analysis?: Analysis | null }
): SerializedVideo {
  const tags = extractTagsFromRaw(video.rawJson);
  const comments = extractCommentsFromRaw(video.rawJson);

  return {
    id: video.id,
    videoId: video.videoId,
    url: video.url,
    title: video.title,
    description: video.description,
    channelTitle: video.channelTitle,
    publishedAt: video.publishedAt.toISOString(),
    thumbnailUrl: video.thumbnailUrl,
    duration: video.duration,
    viewCount: video.viewCount,
    likeCount: video.likeCount,
    commentCount: video.commentCount,
    seedKeyword: video.seedKeyword,
    curationStatus: video.curationStatus as CurationStatus,
    humanNote: video.humanNote,
    publicNote: video.publicNote,
    publishStatus: video.publishStatus,
    isFeatured: video.isFeatured,
    createdAt: video.createdAt.toISOString(),
    updatedAt: video.updatedAt.toISOString(),
    status: video.analysis ? ("analyzed" as const) : ("unanalyzed" as const),
    tags,
    comments,
    analysis: video.analysis
      ? {
          id: video.analysis.id,
          category: video.analysis.category,
          vanishingLifeScore: video.analysis.vanishingLifeScore,
          scores: JSON.parse(video.analysis.scoresJson),
          observe: video.analysis.observe,
          sample: video.analysis.sample,
          recombine: video.analysis.recombine,
          question: video.analysis.question,
          fieldNoteTitle: video.analysis.fieldNoteTitle,
          fieldNote: video.analysis.fieldNote,
          tags: JSON.parse(video.analysis.tagsJson),
          articleAngle: video.analysis.articleAngle,
          articleTitleCandidates: parseArticleTitles(
            video.analysis.articleTitleCandidatesJson
          ),
          model: video.analysis.model,
          publishStatus: video.analysis.publishStatus,
          createdAt: video.analysis.createdAt.toISOString(),
        }
      : undefined,
  };
}

export async function upsertVideoFromSearchResult(
  result: YouTubeSearchResult,
  seedKeyword: string
) {
  const rawJson = mergeRawWithSearchResult(result);

  return prisma.video.upsert({
    where: { videoId: result.videoId },
    create: {
      videoId: result.videoId,
      url: result.url,
      title: result.title,
      description: result.description,
      channelTitle: result.channelTitle,
      publishedAt: new Date(result.publishedAt),
      thumbnailUrl: result.thumbnailUrl,
      duration: result.duration,
      viewCount: result.viewCount,
      likeCount: result.likeCount,
      commentCount: result.commentCount,
      seedKeyword,
      rawJson,
    },
    update: {
      title: result.title,
      description: result.description,
      channelTitle: result.channelTitle,
      thumbnailUrl: result.thumbnailUrl,
      duration: result.duration,
      viewCount: result.viewCount,
      likeCount: result.likeCount,
      commentCount: result.commentCount,
      rawJson,
    },
  });
}

export async function saveAnalysis(
  videoId: string,
  result: Omit<AnalysisResult, "category"> & { category: string },
  model: string
) {
  const articleTitleCandidatesJson =
    result.articleTitleCandidates && result.articleTitleCandidates.length > 0
      ? JSON.stringify(result.articleTitleCandidates)
      : null;

  return prisma.analysis.upsert({
    where: { videoId },
    create: {
      videoId,
      category: result.category,
      vanishingLifeScore: result.vanishingLifeScore,
      scoresJson: JSON.stringify(result.scores),
      observe: result.observe,
      sample: result.sample,
      recombine: result.recombine,
      question: result.question,
      fieldNoteTitle: result.fieldNoteTitle,
      fieldNote: result.fieldNote,
      tagsJson: JSON.stringify(result.tags),
      articleAngle: result.articleAngle ?? null,
      articleTitleCandidatesJson,
      model,
    },
    update: {
      category: result.category,
      vanishingLifeScore: result.vanishingLifeScore,
      scoresJson: JSON.stringify(result.scores),
      observe: result.observe,
      sample: result.sample,
      recombine: result.recombine,
      question: result.question,
      fieldNoteTitle: result.fieldNoteTitle,
      fieldNote: result.fieldNote,
      tagsJson: JSON.stringify(result.tags),
      articleAngle: result.articleAngle ?? null,
      articleTitleCandidatesJson,
      model,
    },
  });
}

export async function updateCurationStatus(
  id: number,
  curationStatus: string
) {
  return prisma.video.update({
    where: { id },
    data: { curationStatus },
  });
}

export async function updateHumanNote(id: number, humanNote: string) {
  return prisma.video.update({
    where: { id },
    data: { humanNote: humanNote || null },
  });
}

export async function updatePublicNote(id: number, publicNote: string) {
  return prisma.video.update({
    where: { id },
    data: { publicNote: publicNote || null },
  });
}

export async function importMockVideos(includeAnalysis = true) {
  const imported: string[] = [];
  const skipped: string[] = [];

  for (const mock of MOCK_VIDEOS) {
    const existing = await prisma.video.findUnique({
      where: { videoId: mock.videoId },
    });
    if (existing) {
      skipped.push(mock.videoId);
      continue;
    }

    await upsertVideoFromSearchResult(mock, mock.tags[0] ?? "mock");

    if (includeAnalysis && MOCK_ANALYSES[mock.videoId]) {
      const analysis = MOCK_ANALYSES[mock.videoId];
      await saveAnalysis(mock.videoId, analysis, "mock-analyzer");
    }

    imported.push(mock.videoId);
  }

  return { imported, skipped, total: MOCK_VIDEOS.length };
}

export async function analyzeVideoById(videoId: string, useMock = false) {
  const video = await prisma.video.findUnique({
    where: { videoId },
    include: { analysis: true },
  });

  if (!video) {
    throw new Error(`Video not found: ${videoId}`);
  }

  const tags = extractTagsFromRaw(video.rawJson);
  const comments = extractCommentsFromRaw(video.rawJson);

  let result: AnalysisResult;
  let model: string;

  if (useMock || !process.env.OPENAI_API_KEY?.trim()) {
    if (!useMock && !process.env.OPENAI_API_KEY?.trim()) {
      const mockAnalysis = MOCK_ANALYSES[videoId];
      if (mockAnalysis) {
        await saveAnalysis(videoId, mockAnalysis, "mock-analyzer");
        return mockAnalysis;
      }
    }
    const mock = analyzeVideoMetadataMock(video);
    result = mock.result;
    model = mock.model;
  } else {
    const { analyzeVideoMetadata } = await import("./openai");
    const analyzed = await analyzeVideoMetadata(video, tags, comments);
    result = analyzed.result;
    model = analyzed.model;
  }

  await saveAnalysis(videoId, result, model);
  return result;
}

export function filterVideos(
  videos: ReturnType<typeof serializeVideo>[],
  filters: {
    category?: string;
    seedKeyword?: string;
    status?: string;
    curationStatus?: string;
    minScore?: string;
    maxScore?: string;
    isFeatured?: string;
    clusterVideoIds?: number[];
  }
) {
  let filtered = videos;

  if (filters.clusterVideoIds && filters.clusterVideoIds.length > 0) {
    const idSet = new Set(filters.clusterVideoIds);
    filtered = filtered.filter((v) => idSet.has(v.id));
  }

  if (filters.category) {
    filtered = filtered.filter((v) => v.analysis?.category === filters.category);
  }
  if (filters.seedKeyword) {
    filtered = filtered.filter((v) => v.seedKeyword === filters.seedKeyword);
  }
  if (filters.status === "analyzed") {
    filtered = filtered.filter((v) => v.status === "analyzed");
  }
  if (filters.status === "unanalyzed") {
    filtered = filtered.filter((v) => v.status === "unanalyzed");
  }
  if (filters.curationStatus) {
    filtered = filtered.filter(
      (v) => v.curationStatus === filters.curationStatus
    );
  }
  if (filters.isFeatured === "true") {
    filtered = filtered.filter((v) => v.isFeatured);
  }
  if (filters.minScore) {
    const min = Number(filters.minScore);
    filtered = filtered.filter(
      (v) => (v.analysis?.vanishingLifeScore ?? -1) >= min
    );
  }
  if (filters.maxScore) {
    const max = Number(filters.maxScore);
    filtered = filtered.filter(
      (v) => (v.analysis?.vanishingLifeScore ?? 999) <= max
    );
  }

  return filtered;
}
