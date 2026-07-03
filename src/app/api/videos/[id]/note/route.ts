import { NextRequest, NextResponse } from "next/server";
import { updateHumanNote } from "@/lib/videos";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as { humanNote?: string };
  const video = await updateHumanNote(numericId, body.humanNote ?? "");
  return NextResponse.json({
    id: video.id,
    humanNote: video.humanNote,
  });
}
