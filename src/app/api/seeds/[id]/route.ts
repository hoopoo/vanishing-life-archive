import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.seedKeyword.delete({ where: { id: numericId } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);
  const body = (await request.json()) as { isActive?: boolean };

  const seed = await prisma.seedKeyword.update({
    where: { id: numericId },
    data: { isActive: body.isActive },
  });

  return NextResponse.json(seed);
}
