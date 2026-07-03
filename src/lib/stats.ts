import { prisma } from "./prisma";
import { seedInitialKeywords } from "./seed";
import { serializeVideo } from "./videos";
import { getArticleDrafts } from "./article";
import { getClusters } from "./clusters";
import { hasOpenAiApiKey } from "./openai";
import { hasYouTubeApiKey } from "./youtube";

export async function getDashboardStats() {
  await seedInitialKeywords();

  const [
    videoCount,
    analyzedCount,
    seedCount,
    activeSeedCount,
    categoryGroups,
    topVideos,
    recentNotes,
    articleCandidates,
    meaningLayerCandidates,
    articleDrafts,
    clusters,
  ] = await Promise.all([
    prisma.video.count(),
    prisma.analysis.count(),
    prisma.seedKeyword.count(),
    prisma.seedKeyword.count({ where: { isActive: true } }),
    prisma.analysis.groupBy({
      by: ["category"],
      _count: { category: true },
    }),
    prisma.analysis.findMany({
      take: 5,
      orderBy: { vanishingLifeScore: "desc" },
      include: { video: true },
    }),
    prisma.analysis.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { video: true },
    }),
    prisma.video.findMany({
      where: { curationStatus: "article_candidate" },
      include: { analysis: true },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.video.findMany({
      where: { curationStatus: "meaning_layer_candidate" },
      include: { analysis: true },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    getArticleDrafts(5),
    getClusters(5),
  ]);

  return {
    videoCount,
    analyzedCount,
    unanalyzedCount: videoCount - analyzedCount,
    seedCount,
    activeSeedCount,
    categoryCounts: Object.fromEntries(
      categoryGroups.map((g) => [g.category, g._count.category])
    ),
    topVideos: topVideos.map((a) => ({
      id: a.video.id,
      videoId: a.videoId,
      title: a.video.title,
      thumbnailUrl: a.video.thumbnailUrl,
      vanishingLifeScore: a.vanishingLifeScore,
      category: a.category,
    })),
    recentFieldNotes: recentNotes.map((a) => ({
      id: a.id,
      videoDbId: a.video.id,
      fieldNoteTitle: a.fieldNoteTitle,
      category: a.category,
      vanishingLifeScore: a.vanishingLifeScore,
      createdAt: a.createdAt.toISOString(),
    })),
    articleCandidates: articleCandidates.map((v) => {
      const s = serializeVideo(v);
      return {
        id: s.id,
        sourceTitle: s.title,
        fieldNoteTitle: s.analysis?.fieldNoteTitle ?? null,
        articleAngle: s.analysis?.articleAngle ?? null,
        category: s.analysis?.category ?? "—",
        vanishingLifeScore: s.analysis?.vanishingLifeScore ?? 0,
        humanNote: s.humanNote,
      };
    }),
    meaningLayerCandidates: meaningLayerCandidates.map((v) => {
      const s = serializeVideo(v);
      return {
        id: s.id,
        sourceTitle: s.title,
        fieldNoteTitle: s.analysis?.fieldNoteTitle ?? null,
        articleAngle: s.analysis?.articleAngle ?? null,
        category: s.analysis?.category ?? "—",
        vanishingLifeScore: s.analysis?.vanishingLifeScore ?? 0,
        humanNote: s.humanNote,
      };
    }),
    articleDrafts: articleDrafts.map((d) => ({
      id: d.id,
      title: d.title,
      subtitle: d.subtitle,
      theme: d.theme,
      status: d.status,
      createdAt: d.createdAt,
    })),
    clusters: clusters.map((c) => ({
      id: c.id,
      title: c.title,
      question: c.question,
      itemCount: c.itemCount,
      candidateCount: c.candidateCount,
      tags: c.tags,
    })),
    apiStatus: {
      youtube: hasYouTubeApiKey(),
      openai: hasOpenAiApiKey(),
    },
  };
}

export async function getVideoById(id: string) {
  const numericId = Number(id);
  const video = await prisma.video.findFirst({
    where: Number.isNaN(numericId) ? { videoId: id } : { id: numericId },
    include: { analysis: true },
  });
  if (!video) return null;
  return serializeVideo(video);
}

export async function getSeedKeywords() {
  await seedInitialKeywords();
  return prisma.seedKeyword.findMany({ orderBy: { keyword: "asc" } });
}
