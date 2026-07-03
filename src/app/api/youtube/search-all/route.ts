import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasYouTubeApiKey, searchYouTubeVideos } from "@/lib/youtube";
import { upsertVideoFromSearchResult } from "@/lib/videos";
import { seedInitialKeywords } from "@/lib/seed";

export async function POST() {
  if (!hasYouTubeApiKey()) {
    return NextResponse.json(
      {
        error: "YOUTUBE_API_KEY is not configured",
        hint: "Use mock data via POST /api/mock/import instead",
      },
      { status: 503 }
    );
  }

  await seedInitialKeywords();

  const seeds = await prisma.seedKeyword.findMany({
    where: { isActive: true },
    orderBy: { keyword: "asc" },
  });

  const summary: Array<{
    keyword: string;
    found: number;
    saved: number;
    videoIds: string[];
    error?: string;
  }> = [];

  for (const seed of seeds) {
    try {
      const results = await searchYouTubeVideos(seed.keyword, 10);
      let saved = 0;

      for (const result of results) {
        const before = await prisma.video.findUnique({
          where: { videoId: result.videoId },
        });
        await upsertVideoFromSearchResult(result, seed.keyword);
        if (!before) saved++;
      }

      summary.push({
        keyword: seed.keyword,
        found: results.length,
        saved,
        videoIds: results.map((r) => r.videoId),
      });
    } catch (error) {
      summary.push({
        keyword: seed.keyword,
        found: 0,
        saved: 0,
        videoIds: [],
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    totalKeywords: seeds.length,
    results: summary,
  });
}
