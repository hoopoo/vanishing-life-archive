import { NextRequest, NextResponse } from "next/server";
import { updatePublicNote } from "@/lib/videos";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as { publicNote?: string };
  const video = await updatePublicNote(numericId, body.publicNote ?? "");
  return NextResponse.json({
    id: video.id,
    publicNote: video.publicNote,
  });
}
