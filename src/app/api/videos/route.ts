import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { filterVideos, serializeVideo } from "@/lib/videos";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const videos = await prisma.video.findMany({
    include: { analysis: true },
    orderBy: { publishedAt: "desc" },
  });

  const filtered = filterVideos(videos.map(serializeVideo), {
    category: searchParams.get("category") ?? undefined,
    seedKeyword: searchParams.get("seedKeyword") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    curationStatus: searchParams.get("curationStatus") ?? undefined,
    minScore: searchParams.get("minScore") ?? undefined,
    maxScore: searchParams.get("maxScore") ?? undefined,
    isFeatured: searchParams.get("isFeatured") ?? undefined,
  });

  return NextResponse.json(filtered);
}
