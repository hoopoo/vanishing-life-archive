-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Analysis" (
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
    "articleAngle" TEXT,
    "articleTitleCandidatesJson" TEXT,
    "model" TEXT NOT NULL,
    "publishStatus" TEXT NOT NULL DEFAULT 'private',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Analysis_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("videoId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Analysis" ("articleAngle", "articleTitleCandidatesJson", "category", "createdAt", "fieldNote", "fieldNoteTitle", "id", "model", "observe", "question", "recombine", "sample", "scoresJson", "tagsJson", "updatedAt", "vanishingLifeScore", "videoId") SELECT "articleAngle", "articleTitleCandidatesJson", "category", "createdAt", "fieldNote", "fieldNoteTitle", "id", "model", "observe", "question", "recombine", "sample", "scoresJson", "tagsJson", "updatedAt", "vanishingLifeScore", "videoId" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
CREATE UNIQUE INDEX "Analysis_videoId_key" ON "Analysis"("videoId");
CREATE TABLE "new_ArticleDraft" (
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
    "titleCandidatesJson" TEXT,
    "linkedinPost" TEXT,
    "noteIntro" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishStatus" TEXT NOT NULL DEFAULT 'private',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ArticleDraft" ("angle", "bodyDraft", "createdAt", "id", "lead", "linkedinPost", "noteIntro", "outlineJson", "questionsJson", "selectedVideoIdsJson", "status", "subtitle", "tagsJson", "theme", "title", "titleCandidatesJson", "updatedAt") SELECT "angle", "bodyDraft", "createdAt", "id", "lead", "linkedinPost", "noteIntro", "outlineJson", "questionsJson", "selectedVideoIdsJson", "status", "subtitle", "tagsJson", "theme", "title", "titleCandidatesJson", "updatedAt" FROM "ArticleDraft";
DROP TABLE "ArticleDraft";
ALTER TABLE "new_ArticleDraft" RENAME TO "ArticleDraft";
CREATE TABLE "new_Cluster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "theme" TEXT NOT NULL DEFAULT '',
    "question" TEXT NOT NULL DEFAULT '',
    "tagsJson" TEXT NOT NULL DEFAULT '[]',
    "summary" TEXT,
    "hypothesis" TEXT,
    "articleAnglesJson" TEXT,
    "generatedQuestionsJson" TEXT,
    "recommendedTitle" TEXT,
    "publishStatus" TEXT NOT NULL DEFAULT 'private',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Cluster" ("articleAnglesJson", "createdAt", "description", "generatedQuestionsJson", "hypothesis", "id", "question", "recommendedTitle", "summary", "tagsJson", "theme", "title", "updatedAt") SELECT "articleAnglesJson", "createdAt", "description", "generatedQuestionsJson", "hypothesis", "id", "question", "recommendedTitle", "summary", "tagsJson", "theme", "title", "updatedAt" FROM "Cluster";
DROP TABLE "Cluster";
ALTER TABLE "new_Cluster" RENAME TO "Cluster";
CREATE TABLE "new_Video" (
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
    "curationStatus" TEXT NOT NULL DEFAULT 'unreviewed',
    "humanNote" TEXT,
    "publicNote" TEXT,
    "publishStatus" TEXT NOT NULL DEFAULT 'private',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Video" ("channelTitle", "commentCount", "createdAt", "curationStatus", "description", "duration", "humanNote", "id", "isFeatured", "likeCount", "publishedAt", "rawJson", "seedKeyword", "thumbnailUrl", "title", "updatedAt", "url", "videoId", "viewCount") SELECT "channelTitle", "commentCount", "createdAt", "curationStatus", "description", "duration", "humanNote", "id", "isFeatured", "likeCount", "publishedAt", "rawJson", "seedKeyword", "thumbnailUrl", "title", "updatedAt", "url", "videoId", "viewCount" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
CREATE UNIQUE INDEX "Video_videoId_key" ON "Video"("videoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
