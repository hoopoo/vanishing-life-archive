import { NextRequest, NextResponse } from "next/server";
import { getVideosForArticleStudioFromCluster } from "@/lib/clusters";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const clusterId = Number(id);
  if (Number.isNaN(clusterId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const videos = await getVideosForArticleStudioFromCluster(clusterId);
  if (!videos) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(videos);
}
