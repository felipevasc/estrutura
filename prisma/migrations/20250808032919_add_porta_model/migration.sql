-- CreateTable
CREATE TABLE "portas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" INTEGER NOT NULL,
    "protocolo" TEXT NOT NULL,
    "estado" TEXT,
    "servico" TEXT,
    "ipId" INTEGER NOT NULL,
    CONSTRAINT "portas_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ips" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
