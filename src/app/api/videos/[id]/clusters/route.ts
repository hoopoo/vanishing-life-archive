import { NextRequest, NextResponse } from "next/server";
import { getClusters, getVideoClusters } from "@/lib/clusters";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const videoId = Number(id);
  if (Number.isNaN(videoId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const [memberships, allClusters] = await Promise.all([
    getVideoClusters(videoId),
    getClusters(),
  ]);

  return NextResponse.json({ memberships, allClusters });
}
