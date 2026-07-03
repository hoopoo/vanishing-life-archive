import { NextRequest, NextResponse } from "next/server";
import { hasYouTubeApiKey, searchYouTubeVideos } from "@/lib/youtube";
import { upsertVideoFromSearchResult } from "@/lib/videos";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    keyword?: string;
    maxResults?: number;
  };

  if (!body.keyword?.trim()) {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }

  const keyword = body.keyword.trim();
  const maxResults = body.maxResults ?? 10;

  if (!hasYouTubeApiKey()) {
    return NextResponse.json(
      {
        error: "YOUTUBE_API_KEY is not configured",
        hint: "Use mock data via POST /api/mock/import instead",
      },
      { status: 503 }
    );
  }

  try {
    const results = await searchYouTubeVideos(keyword, maxResults);
    const saved: string[] = [];
    const skipped: string[] = [];

    for (const result of results) {
      const existing = await upsertVideoFromSearchResult(result, keyword);
      if (existing.createdAt.getTime() === existing.updatedAt.getTime()) {
        saved.push(result.videoId);
      } else {
        skipped.push(result.videoId);
      }
    }

    return NextResponse.json({
      keyword,
      found: results.length,
      saved: saved.length,
      updated: skipped.length,
      videoIds: results.map((r) => r.videoId),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
