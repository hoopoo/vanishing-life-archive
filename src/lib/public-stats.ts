import { prisma } from "./prisma";
import { EXPORTABLE_PUBLISH_STATUSES } from "./constants";
import { isStaticPublicSite, loadPublicSiteData } from "./public-site-data";
import type { PublicDashboardStats } from "./public-stats-types";
import { getClusters } from "./clusters";
import { getObservatoryCardDisplay } from "./observatory-display";
import { isExportablePublishStatus } from "./public-export";
import { seedInitialKeywords } from "./seed";

const exportable = [...EXPORTABLE_PUBLISH_STATUSES];

export type { PublicDashboardStats } from "./public-stats-types";

export async function getPublicDashboardStats(): Promise<PublicDashboardStats> {
  if (isStaticPublicSite()) {
    return (await loadPublicSiteData()).stats;
  }

  await seedInitialKeywords();

  const [
    publicVideoCount,
    publicAnalyses,
    activeSeedCount,
    articleCandidatesRaw,
    meaningLayerCandidatesRaw,
    allPublicClusters,
    seeds,
  ] = await Promise.all([
    prisma.video.count({
      where: { publishStatus: { in: exportable } },
    }),
    prisma.analysis.findMany({
      where: { publishStatus: { in: exportable } },
      include: { video: true },
    }),
    prisma.seedKeyword.count({ where: { isActive: true } }),
    prisma.video.findMany({
      where: {
        curationStatus: "article_candidate",
        publishStatus: { in: exportable },
      },
      include: { analysis: true },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.video.findMany({
      where: {
        curationStatus: "meaning_layer_candidate",
        publishStatus: { in: exportable },
      },
      include: { analysis: true },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    getClusters(),
    prisma.seedKeyword.findMany({ orderBy: { keyword: "asc" } }),
  ]);

  const exportableAnalyses = publicAnalyses.filter(
    (a) =>
      isExportablePublishStatus(a.video.publishStatus) &&
      a.video.curationStatus !== "meaning_layer_candidate"
  );

  const categoryCounts: Record<string, number> = {};
  for (const a of exportableAnalyses) {
    categoryCounts[a.category] = (categoryCounts[a.category] ?? 0) + 1;
  }

  const recentFieldNotes = [...exportableAnalyses]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)
    .map((a) => ({
      videoId: a.video.videoId,
      fieldNoteTitle: a.fieldNoteTitle,
      category: a.category,
      vanishingLifeScore: a.vanishingLifeScore,
    }));

  const topVideos = [...exportableAnalyses]
    .sort((a, b) => b.vanishingLifeScore - a.vanishingLifeScore)
    .slice(0, 5)
    .map((a) => ({
      videoId: a.video.videoId,
      title: a.fieldNoteTitle,
      vanishingLifeScore: a.vanishingLifeScore,
      category: a.category,
    }));

  const mapCandidate = (v: (typeof articleCandidatesRaw)[0]) => {
    const display = getObservatoryCardDisplay({
      sourceTitle: v.title,
      fieldNoteTitle: v.analysis?.fieldNoteTitle ?? null,
      articleAngle: v.analysis?.articleAngle ?? null,
      humanNote: null,
    });
    return {
      videoId: v.videoId,
      heading: display.heading,
      subline: display.subline,
      publicNoteExcerpt: v.publicNote?.trim()
        ? v.publicNote.trim().slice(0, 120) +
          (v.publicNote.trim().length > 120 ? "…" : "")
        : null,
      sourceTitle: v.title,
      category: v.analysis?.category ?? "—",
      vanishingLifeScore: v.analysis?.vanishingLifeScore ?? 0,
    };
  };

  const publicClusters = allPublicClusters.filter((c) =>
    exportable.includes(c.publishStatus as (typeof exportable)[number])
  );

  const publicVideosWithoutAnalysis = await prisma.video.count({
    where: {
      publishStatus: { in: exportable },
      analysis: null,
    },
  });

  return {
    videoCount: publicVideoCount,
    fieldNoteCount: exportableAnalyses.length,
    unanalyzedPublicCount: publicVideosWithoutAnalysis,
    meaningLayerCount: meaningLayerCandidatesRaw.length,
    activeSeedCount,
    categoryCounts,
    recentFieldNotes,
    topVideos,
    articleCandidates: articleCandidatesRaw.map(mapCandidate),
    meaningLayerCandidates: meaningLayerCandidatesRaw.map(mapCandidate),
    clusters: publicClusters.slice(0, 5).map((c) => ({
      id: c.id,
      title: c.title,
      question: c.question,
      itemCount: c.itemCount,
      candidateCount: c.candidateCount,
      tags: c.tags,
    })),
    seeds,
  };
}
