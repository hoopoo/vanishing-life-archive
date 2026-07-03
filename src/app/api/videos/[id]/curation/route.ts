import { NextRequest, NextResponse } from "next/server";
import { updateCurationStatus } from "@/lib/videos";
import { CURATION_STATUSES } from "@/lib/constants";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as { curationStatus?: string };

  if (
    !body.curationStatus ||
    !CURATION_STATUSES.includes(
      body.curationStatus as (typeof CURATION_STATUSES)[number]
    )
  ) {
    return NextResponse.json(
      { error: "Invalid curationStatus" },
      { status: 400 }
    );
  }

  const video = await updateCurationStatus(numericId, body.curationStatus);
  return NextResponse.json({
    id: video.id,
    curationStatus: video.curationStatus,
  });
}
