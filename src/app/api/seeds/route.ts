import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedInitialKeywords } from "@/lib/seed";

export async function GET() {
  await seedInitialKeywords();
  const seeds = await prisma.seedKeyword.findMany({
    orderBy: { keyword: "asc" },
  });
  return NextResponse.json(seeds);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    keyword?: string;
    isActive?: boolean;
  };

  if (!body.keyword?.trim()) {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }

  const seed = await prisma.seedKeyword.create({
    data: {
      keyword: body.keyword.trim(),
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json(seed, { status: 201 });
}
