import { NextResponse } from "next/server";
import { buildPublicBundle, publicBundleToMarkdown } from "@/lib/public-export";

export async function GET() {
  const bundle = await buildPublicBundle();
  const markdown = publicBundleToMarkdown(bundle);
  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="vanishing-life-public-${Date.now()}.md"`,
    },
  });
}
