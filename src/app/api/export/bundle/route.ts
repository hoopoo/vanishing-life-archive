import { NextResponse } from "next/server";
import { buildPublicBundle } from "@/lib/public-export";

export async function GET() {
  const bundle = await buildPublicBundle();
  return NextResponse.json(bundle, {
    headers: {
      "Content-Disposition": `attachment; filename="vanishing-life-public-${Date.now()}.json"`,
    },
  });
}
