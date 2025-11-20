-- CreateTable
CREATE TABLE "diretorios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caminho" TEXT NOT NULL,
    "status" INTEGER,
    "tamanho" INTEGER,
    "dominioId" INTEGER,
    "ipId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "diretorios_dominioId_fkey" FOREIGN KEY ("dominioId") REFERENCES "dominios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "diretorios_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ips" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
