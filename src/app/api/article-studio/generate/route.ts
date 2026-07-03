import { NextRequest, NextResponse } from "next/server";
import { generateArticleFromVideos } from "@/lib/article";
import { hasOpenAiApiKey } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    videoIds?: number[];
    useMock?: boolean;
  };

  if (!body.videoIds?.length) {
    return NextResponse.json(
      { error: "videoIds is required" },
      { status: 400 }
    );
  }

  try {
    const useMock = body.useMock ?? !hasOpenAiApiKey();
    const { result, draft } = await generateArticleFromVideos(
      body.videoIds,
      useMock
    );
    return NextResponse.json({ result, draft, useMock });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
