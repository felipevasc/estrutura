/*
  Warnings:

  - You are about to drop the `Execucao` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Execucao";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "commands" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "command" TEXT NOT NULL,
    "args" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "output" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "commands_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projetos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
