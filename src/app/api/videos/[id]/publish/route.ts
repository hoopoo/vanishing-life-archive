import { NextRequest, NextResponse } from "next/server";
import { PUBLISH_STATUSES, type PublishStatus } from "@/lib/constants";
import { updateVideoPublishStatus } from "@/lib/publish";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as { publishStatus?: string };
  if (
    !body.publishStatus ||
    !PUBLISH_STATUSES.includes(body.publishStatus as PublishStatus)
  ) {
    return NextResponse.json({ error: "Invalid publishStatus" }, { status: 400 });
  }

  const video = await updateVideoPublishStatus(
    numericId,
    body.publishStatus as PublishStatus
  );
  return NextResponse.json({ id: video.id, publishStatus: video.publishStatus });
}
