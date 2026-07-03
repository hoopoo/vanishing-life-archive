-- CreateTable
CREATE TABLE "SeedKeyword" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "keyword" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Video" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "videoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "channelTitle" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "thumbnailUrl" TEXT NOT NULL DEFAULT '',
    "duration" TEXT NOT NULL DEFAULT '',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "seedKeyword" TEXT NOT NULL,
    "rawJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "videoId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "vanishingLifeScore" INTEGER NOT NULL,
    "scoresJson" TEXT NOT NULL,
    "observe" TEXT NOT NULL,
    "sample" TEXT NOT NULL,
    "recombine" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "fieldNoteTitle" TEXT NOT NULL,
    "fieldNote" TEXT NOT NULL,
    "tagsJson" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Analysis_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("videoId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SeedKeyword_keyword_key" ON "SeedKeyword"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "Video_videoId_key" ON "Video"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_videoId_key" ON "Analysis"("videoId");
