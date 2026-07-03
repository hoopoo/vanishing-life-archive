import { NextRequest, NextResponse } from "next/server";
import { runEditorialAction } from "@/lib/editorial";
import type { EditorialActionType } from "@/lib/editorial-types";
import { EDITORIAL_ACTIONS } from "@/lib/editorial-types";

const VALID_ACTIONS = new Set(
  EDITORIAL_ACTIONS.map((a) => a.type)
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as { actionType?: string; useMock?: boolean };
  const actionType = body.actionType as EditorialActionType | undefined;

  if (!actionType || !VALID_ACTIONS.has(actionType)) {
    return NextResponse.json({ error: "Invalid actionType" }, { status: 400 });
  }

  try {
    const draft = await runEditorialAction(
      numericId,
      actionType,
      body.useMock ?? false
    );
    return NextResponse.json(draft);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Editorial action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
