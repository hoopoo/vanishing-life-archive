import { NextResponse } from "next/server";
import { getExportQueue } from "@/lib/public-export";

export async function GET() {
  const queue = await getExportQueue();
  return NextResponse.json(queue);
}
