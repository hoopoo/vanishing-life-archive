import { NextRequest, NextResponse } from "next/server";
import { importMockVideos } from "@/lib/videos";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    includeAnalysis?: boolean;
  };

  const result = await importMockVideos(body.includeAnalysis ?? true);
  return NextResponse.json(result);
}
