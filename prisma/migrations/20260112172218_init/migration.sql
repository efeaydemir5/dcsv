/*
  Warnings:

  - You are about to drop the column `featured` on the `Server` table. All the data in the column will be lost.
  - Added the required column `discordId` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerDiscordId` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Server` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Server" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "invite" TEXT,
    "category" TEXT,
    "ownerDiscordId" TEXT NOT NULL,
    "membersCount" INTEGER,
    "tags" JSONB,
    "avatarUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredUntil" DATETIME,
    "bumpedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING'
);
INSERT INTO "new_Server" ("category", "createdAt", "description", "id", "invite", "name") SELECT "category", "createdAt", "description", "id", "invite", "name" FROM "Server";
DROP TABLE "Server";
ALTER TABLE "new_Server" RENAME TO "Server";
CREATE UNIQUE INDEX "Server_discordId_key" ON "Server"("discordId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
