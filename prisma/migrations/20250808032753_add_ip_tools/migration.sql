-- CreateTable
CREATE TABLE "portas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" INTEGER NOT NULL,
    "protocolo" TEXT,
    "servico" TEXT,
    "estado" TEXT,
    "ipId" INTEGER NOT NULL,
    CONSTRAINT "portas_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ips" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ip_infos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "chave" TEXT,
    "valor" TEXT NOT NULL,
    "ipId" INTEGER NOT NULL,
    CONSTRAINT "ip_infos_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ips" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
