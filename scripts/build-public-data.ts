import "dotenv/config";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPublicBundle } from "../src/lib/public-export";
import { getPublicDashboardStats } from "../src/lib/public-stats";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "src/data/public-site.json");

async function main() {
  const [bundle, stats] = await Promise.all([
    buildPublicBundle(),
    getPublicDashboardStats(),
  ]);

  const payload = {
    generatedAt: new Date().toISOString(),
    bundle,
    stats,
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");

  console.log(`Wrote ${outPath}`);
  console.log(
    `Videos: ${bundle.videos.length}, Field Notes: ${bundle.fieldNotes.length}, Meaning Layer: ${bundle.meaningLayer.length}`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    const { createPrismaClient } = await import("../src/lib/prisma");
    await createPrismaClient().$disconnect();
  });
