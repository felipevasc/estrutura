-- CreateTable
CREATE TABLE "portas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" INTEGER NOT NULL,
    "protocolo" TEXT NOT NULL,
    "servico" TEXT,
    "status" TEXT NOT NULL,
    "banner" TEXT,
    "ipId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "portas_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ips" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
