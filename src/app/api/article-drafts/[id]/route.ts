import { NextRequest, NextResponse } from "next/server";
import { getArticleDraftById, updateArticleDraft } from "@/lib/article";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const draft = await getArticleDraftById(numericId);
  if (!draft) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(draft);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as {
    title?: string;
    subtitle?: string;
    theme?: string;
    angle?: string;
    lead?: string;
    bodyDraft?: string;
    status?: string;
  };

  try {
    const draft = await updateArticleDraft(numericId, body);
    return NextResponse.json(draft);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
