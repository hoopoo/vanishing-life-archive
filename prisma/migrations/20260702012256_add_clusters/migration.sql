-- CreateTable
CREATE TABLE "Cluster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "theme" TEXT NOT NULL DEFAULT '',
    "question" TEXT NOT NULL DEFAULT '',
    "tagsJson" TEXT NOT NULL DEFAULT '[]',
    "summary" TEXT,
    "articleAnglesJson" TEXT,
    "generatedQuestionsJson" TEXT,
    "recommendedTitle" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ClusterItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clusterId" INTEGER NOT NULL,
    "videoId" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClusterItem_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClusterItem_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ClusterItem_clusterId_videoId_key" ON "ClusterItem"("clusterId", "videoId");
