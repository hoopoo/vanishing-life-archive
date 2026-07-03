import { NextRequest, NextResponse } from "next/server";
import { addVideoToCluster, getClusterById } from "@/lib/clusters";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const clusterId = Number(id);
  if (Number.isNaN(clusterId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as { videoId?: number; note?: string };
  if (!body.videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }

  try {
    await addVideoToCluster(clusterId, body.videoId, body.note);
    const cluster = await getClusterById(clusterId);
    return NextResponse.json(cluster);
  } catch {
    return NextResponse.json({ error: "Failed to add video" }, { status: 500 });
  }
}
