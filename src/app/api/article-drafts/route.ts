import { NextResponse } from "next/server";
import { getArticleDrafts } from "@/lib/article";

export async function GET() {
  const drafts = await getArticleDrafts();
  return NextResponse.json(drafts);
}
