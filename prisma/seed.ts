import "dotenv/config";
import { createPrismaClient } from "../src/lib/prisma";
import { INITIAL_SEED_KEYWORDS } from "../src/lib/constants";

const prisma = createPrismaClient();

async function main() {
  for (const keyword of INITIAL_SEED_KEYWORDS) {
    await prisma.seedKeyword.upsert({
      where: { keyword },
      create: { keyword, isActive: true },
      update: {},
    });
  }
  console.log(`Seeded ${INITIAL_SEED_KEYWORDS.length} keywords`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
