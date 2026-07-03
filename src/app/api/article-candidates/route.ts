import { NextResponse } from "next/server";
import { getArticleCandidates } from "@/lib/article";

export async function GET() {
  const candidates = await getArticleCandidates();
  return NextResponse.json(candidates);
}
