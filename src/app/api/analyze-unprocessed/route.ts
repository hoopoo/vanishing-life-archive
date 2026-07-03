import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeVideoById } from "@/lib/videos";
import { hasOpenAiApiKey } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    useMock?: boolean;
    limit?: number;
  };
  const useMock = body.useMock ?? !hasOpenAiApiKey();
  const limit = body.limit ?? 20;

  const unprocessed = await prisma.video.findMany({
    where: { analysis: null },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  const results: Array<{ videoId: string; success: boolean; error?: string }> =
    [];

  for (const video of unprocessed) {
    try {
      await analyzeVideoById(video.videoId, useMock);
      results.push({ videoId: video.videoId, success: true });
    } catch (error) {
      results.push({
        videoId: video.videoId,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    processed: results.length,
    success: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    useMock,
    results,
  });
}
