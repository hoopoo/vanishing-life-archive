import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeVideo } from "@/lib/videos";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  const video = await prisma.video.findFirst({
    where: Number.isNaN(numericId) ? { videoId: id } : { id: numericId },
    include: { analysis: true },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  return NextResponse.json(serializeVideo(video));
}
