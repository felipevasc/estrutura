-- CreateTable
CREATE TABLE "portas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" INTEGER NOT NULL,
    "servico" TEXT,
    "versao" TEXT,
    "ipId" INTEGER,
    CONSTRAINT "portas_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ips" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
