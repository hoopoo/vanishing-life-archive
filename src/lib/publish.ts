import { prisma } from "./prisma";
import type { PublishStatus } from "./constants";

export async function updateVideoPublishStatus(
  id: number,
  publishStatus: PublishStatus
) {
  return prisma.video.update({
    where: { id },
    data: { publishStatus },
  });
}

export async function updateAnalysisPublishStatus(
  analysisId: number,
  publishStatus: PublishStatus
) {
  return prisma.analysis.update({
    where: { id: analysisId },
    data: { publishStatus },
  });
}

export async function updateArticleDraftPublishStatus(
  id: number,
  publishStatus: PublishStatus
) {
  return prisma.articleDraft.update({
    where: { id },
    data: { publishStatus },
  });
}

export async function updateClusterPublishStatus(
  id: number,
  publishStatus: PublishStatus
) {
  return prisma.cluster.update({
    where: { id },
    data: { publishStatus },
  });
}
