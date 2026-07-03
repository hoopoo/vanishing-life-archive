import { NextRequest, NextResponse } from "next/server";
import { generateClusterSummary } from "@/lib/clusters";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as { useMock?: boolean };

  try {
    const data = await generateClusterSummary(numericId, body.useMock ?? false);
    return NextResponse.json(data);
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Summary generation failed";
    const message =
      raw.includes("at least one video") || raw.includes("Add observations")
        ? "所属動画がありません。Cluster Summaryは、追加された生活断片のField NoteとHuman Noteから生成されます。"
        : raw;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
