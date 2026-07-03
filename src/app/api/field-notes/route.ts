import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const analyses = await prisma.analysis.findMany({
    include: { video: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    analyses.map((a) => ({
      id: a.id,
      videoId: a.videoId,
      videoDbId: a.video.id,
      category: a.category,
      vanishingLifeScore: a.vanishingLifeScore,
      fieldNoteTitle: a.fieldNoteTitle,
      fieldNote: a.fieldNote,
      question: a.question,
      tags: JSON.parse(a.tagsJson),
      thumbnailUrl: a.video.thumbnailUrl,
      title: a.video.title,
      channelTitle: a.video.channelTitle,
      createdAt: a.createdAt.toISOString(),
    }))
  );
}
