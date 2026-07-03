import { prisma } from "./prisma";
import { INITIAL_SEED_KEYWORDS } from "./constants";

export async function seedInitialKeywords() {
  for (const keyword of INITIAL_SEED_KEYWORDS) {
    await prisma.seedKeyword.upsert({
      where: { keyword },
      create: { keyword, isActive: true },
      update: {},
    });
  }
}
