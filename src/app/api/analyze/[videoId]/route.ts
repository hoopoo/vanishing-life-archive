import { NextRequest, NextResponse } from "next/server";
import { analyzeVideoById } from "@/lib/videos";
import { hasOpenAiApiKey } from "@/lib/openai";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;
  const body = (await request.json().catch(() => ({}))) as { useMock?: boolean };
  const useMock = body.useMock ?? !hasOpenAiApiKey();

  try {
    const result = await analyzeVideoById(videoId, useMock);
    return NextResponse.json({ videoId, analysis: result, useMock });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
