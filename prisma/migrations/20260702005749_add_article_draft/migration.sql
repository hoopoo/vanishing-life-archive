-- CreateTable
CREATE TABLE "ArticleDraft" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "theme" TEXT NOT NULL DEFAULT '',
    "angle" TEXT NOT NULL DEFAULT '',
    "lead" TEXT NOT NULL DEFAULT '',
    "outlineJson" TEXT NOT NULL DEFAULT '[]',
    "selectedVideoIdsJson" TEXT NOT NULL DEFAULT '[]',
    "bodyDraft" TEXT NOT NULL DEFAULT '',
    "questionsJson" TEXT NOT NULL DEFAULT '[]',
    "tagsJson" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
