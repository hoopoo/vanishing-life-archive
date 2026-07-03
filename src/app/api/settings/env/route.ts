import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const ENV_PATH = path.join(process.cwd(), ".env.local");

function parseEnvFile(content: string): {
  DATABASE_URL: string;
  YOUTUBE_API_KEY: string;
  OPENAI_API_KEY: string;
} {
  const values = {
    DATABASE_URL: "file:./dev.db",
    YOUTUBE_API_KEY: "",
    OPENAI_API_KEY: "",
  };

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key in values) {
      values[key as keyof typeof values] = value;
    }
  }

  return values;
}

function maskKey(key: string) {
  if (!key) return "";
  if (key.length <= 8) return "********";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export async function GET() {
  let values = {
    DATABASE_URL: "file:./dev.db",
    YOUTUBE_API_KEY: "",
    OPENAI_API_KEY: "",
  };

  if (fs.existsSync(ENV_PATH)) {
    values = parseEnvFile(fs.readFileSync(ENV_PATH, "utf8"));
  }

  return NextResponse.json({
    path: ENV_PATH,
    youtubeConfigured: Boolean(values.YOUTUBE_API_KEY?.trim()),
    openaiConfigured: Boolean(values.OPENAI_API_KEY?.trim()),
    youtubeMasked: maskKey(values.YOUTUBE_API_KEY),
    openaiMasked: maskKey(values.OPENAI_API_KEY),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    youtubeApiKey?: string;
    openaiApiKey?: string;
  };

  let existing = {
    DATABASE_URL: "file:./dev.db",
    YOUTUBE_API_KEY: "",
    OPENAI_API_KEY: "",
  };

  if (fs.existsSync(ENV_PATH)) {
    existing = parseEnvFile(fs.readFileSync(ENV_PATH, "utf8"));
  }

  const youtube = body.youtubeApiKey?.trim()
    ? body.youtubeApiKey.trim()
    : existing.YOUTUBE_API_KEY;
  const openai = body.openaiApiKey?.trim()
    ? body.openaiApiKey.trim()
    : existing.OPENAI_API_KEY;

  const content = `DATABASE_URL="file:./dev.db"
YOUTUBE_API_KEY="${youtube}"
OPENAI_API_KEY="${openai}"
`;

  fs.writeFileSync(ENV_PATH, content, "utf8");

  return NextResponse.json({
    success: true,
    path: ENV_PATH,
    youtubeConfigured: Boolean(youtube),
    openaiConfigured: Boolean(openai),
    message: "保存しました。反映には開発サーバーの再起動が必要です。",
  });
}
