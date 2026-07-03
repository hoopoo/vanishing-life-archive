-- AlterTable
ALTER TABLE "Analysis" ADD COLUMN "articleAngle" TEXT;
ALTER TABLE "Analysis" ADD COLUMN "articleTitleCandidatesJson" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Video" ("channelTitle", "commentCount", "createdAt", "description", "duration", "id", "likeCount", "publishedAt", "rawJson", "seedKeyword", "thumbnailUrl", "title", "updatedAt", "url", "videoId", "viewCount") SELECT "channelTitle", "commentCount", "createdAt", "description", "duration", "id", "likeCount", "publishedAt", "rawJson", "seedKeyword", "thumbnailUrl", "title", "updatedAt", "url", "videoId", "viewCount" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
CREATE UNIQUE INDEX "Video_videoId_key" ON "Video"("videoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
