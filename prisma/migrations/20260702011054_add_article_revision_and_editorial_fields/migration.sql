-- AlterTable
ALTER TABLE "ArticleDraft" ADD COLUMN "linkedinPost" TEXT;
ALTER TABLE "ArticleDraft" ADD COLUMN "noteIntro" TEXT;
ALTER TABLE "ArticleDraft" ADD COLUMN "titleCandidatesJson" TEXT;

-- CreateTable
CREATE TABLE "ArticleRevision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleDraftId" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "beforeJson" TEXT NOT NULL,
    "afterJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArticleRevision_articleDraftId_fkey" FOREIGN KEY ("articleDraftId") REFERENCES "ArticleDraft" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
