import "dotenv/config";
import { createPrismaClient } from "../src/lib/prisma";
import {
  CLUSTER_CANDIDATE_RULES,
  scoreVideoForCluster,
  type VideoForMatching,
} from "../src/lib/cluster-candidates";

const prisma = createPrismaClient();
const MAX_PER_CLUSTER = 12;

async function main() {
  const clusters = await prisma.cluster.findMany({ orderBy: { id: "asc" } });
  const videos = await prisma.video.findMany({
    include: { analysis: true },
    orderBy: { updatedAt: "desc" },
  });

  let totalAdded = 0;

  for (const cluster of clusters) {
    const rule = CLUSTER_CANDIDATE_RULES[cluster.title];
    if (!rule) continue;

    const existing = await prisma.clusterItem.findMany({
      where: { clusterId: cluster.id },
      select: { videoId: true },
    });
    const memberIds = new Set(existing.map((e) => e.videoId));

    const scored = videos
      .filter((v) => !memberIds.has(v.id) && v.analysis)
      .map((v) => {
        let analysisTags: string[] = [];
        if (v.analysis?.tagsJson) {
          try {
            analysisTags = JSON.parse(v.analysis.tagsJson) as string[];
          } catch {
            analysisTags = [];
          }
        }
        const input: VideoForMatching = {
          id: v.id,
          title: v.title,
          description: v.description,
          category: v.analysis?.category ?? null,
          analysisTags,
          fieldNoteTitle: v.analysis?.fieldNoteTitle ?? null,
          fieldNote: v.analysis?.fieldNote ?? null,
          humanNote: v.humanNote,
          vanishingLifeScore: v.analysis?.vanishingLifeScore ?? 0,
        };
        return { videoId: v.id, score: scoreVideoForCluster(input, rule) };
      })
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_PER_CLUSTER);

    for (const entry of scored) {
      await prisma.clusterItem.create({
        data: {
          clusterId: cluster.id,
          videoId: entry.videoId,
          note: "ルールベース自動割当 — カテゴリ・キーワード一致",
        },
      });
      totalAdded++;
    }

    console.log(`${cluster.title}: +${scored.length} (total will be ${memberIds.size + scored.length})`);
  }

  console.log(`Added ${totalAdded} cluster items`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
