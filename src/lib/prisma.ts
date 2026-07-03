import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaGeneration?: number;
};

const SCHEMA_GENERATION = 8;

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });
  return new PrismaClient({ adapter });
}

function clientHasRequiredModels(client: PrismaClient): boolean {
  return (
    typeof client.video?.findMany === "function" &&
    typeof client.articleDraft?.findMany === "function" &&
    typeof client.articleRevision?.findMany === "function" &&
    typeof client.cluster?.findMany === "function" &&
    typeof client.clusterItem?.findMany === "function"
  );
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (
    cached &&
    globalForPrisma.prismaSchemaGeneration === SCHEMA_GENERATION &&
    clientHasRequiredModels(cached)
  ) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect();
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  globalForPrisma.prismaSchemaGeneration = SCHEMA_GENERATION;
  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export { createPrismaClient };
