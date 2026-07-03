import { NextRequest, NextResponse } from "next/server";
import {
  articleDraftToMarkdown,
  getArticleDraftById,
} from "@/lib/article";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);
  const draft = await getArticleDraftById(numericId);
  if (!draft) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const markdown = articleDraftToMarkdown(draft);
  const filename = `article-draft-${draft.id}.md`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
