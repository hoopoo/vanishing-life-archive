import { NextRequest, NextResponse } from "next/server";
import {
  removeVideoFromCluster,
  updateClusterItemNote,
} from "@/lib/clusters";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = Number(id);
  if (Number.isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as { note?: string };
  try {
    const item = await updateClusterItemNote(itemId, body.note ?? "");
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = Number(id);
  if (Number.isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await removeVideoFromCluster(itemId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
