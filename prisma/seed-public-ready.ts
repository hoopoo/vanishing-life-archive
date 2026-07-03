import "dotenv/config";
import { createPrismaClient } from "../src/lib/prisma";

const prisma = createPrismaClient();

async function main() {
  const analyses = await prisma.analysis.findMany({
    where: { publishStatus: { notIn: ["public_ready", "published"] } },
    select: { id: true, videoId: true },
  });

  const articles = await prisma.articleDraft.findMany({
    where: { publishStatus: { notIn: ["public_ready", "published"] } },
    select: { id: true },
  });

  const clusters = await prisma.cluster.findMany({
    where: { publishStatus: { notIn: ["public_ready", "published"] } },
    select: { id: true, title: true, summary: true },
  });

  for (const a of analyses) {
    await prisma.analysis.update({
      where: { id: a.id },
      data: { publishStatus: "public_ready" },
    });
    await prisma.video.update({
      where: { videoId: a.videoId },
      data: {
        publishStatus: "public_ready",
        publicNote:
          "公開用メモ — 生活断片の観測記録として整理済み。",
      },
    });
  }

  for (const d of articles) {
    await prisma.articleDraft.update({
      where: { id: d.id },
      data: { publishStatus: "public_ready" },
    });
  }

  for (const c of clusters) {
    await prisma.cluster.update({
      where: { id: c.id },
      data: {
        publishStatus: "public_ready",
        summary:
          c.summary ??
          `${c.title} — 複数の生活断片から見えてきた消失パターンの仮説。`,
      },
    });
  }

  const meaningLayerVideos = await prisma.video.findMany({
    where: {
      curationStatus: "meaning_layer_candidate",
      publishStatus: { notIn: ["public_ready", "published"] },
    },
    include: { analysis: true },
  });

  for (const v of meaningLayerVideos) {
    await prisma.video.update({
      where: { id: v.id },
      data: {
        publishStatus: "public_ready",
        publicNote:
          v.publicNote?.trim() ||
          "公開用メモ — Meaning Layer 断片として整理済み。",
      },
    });
    if (v.analysis) {
      await prisma.analysis.update({
        where: { id: v.analysis.id },
        data: { publishStatus: "public_ready" },
      });
    }
  }

  const [totalVideos, analyzed, readyA, readyArt, readyC, readyMl] =
    await Promise.all([
    prisma.video.count(),
    prisma.analysis.count(),
    prisma.analysis.count({
      where: { publishStatus: { in: ["public_ready", "published"] } },
    }),
    prisma.articleDraft.count({
      where: { publishStatus: { in: ["public_ready", "published"] } },
    }),
    prisma.cluster.count({
      where: { publishStatus: { in: ["public_ready", "published"] } },
    }),
    prisma.video.count({
      where: {
        curationStatus: "meaning_layer_candidate",
        publishStatus: { in: ["public_ready", "published"] },
      },
    }),
  ]);

  console.log(
    `Marked public_ready: +${analyses.length} field notes, +${articles.length} articles, +${clusters.length} clusters, +${meaningLayerVideos.length} meaning layer`
  );
  console.log(
    `Totals: ${readyA} field notes, ${readyMl} meaning layer, ${readyArt} articles, ${readyC} clusters (${totalVideos} videos observed)`
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
