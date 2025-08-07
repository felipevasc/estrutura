-- AlterTable
ALTER TABLE "ips" ADD COLUMN "reverseDns" TEXT;

-- CreateTable
CREATE TABLE "portas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" INTEGER NOT NULL,
    "protocolo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "servico" TEXT,
    "versao" TEXT,
    "criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizacao" DATETIME NOT NULL,
    "ipId" INTEGER NOT NULL,
    CONSTRAINT "portas_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ips" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vulnerabilidades" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "severidade" TEXT NOT NULL,
    "referencias" TEXT NOT NULL,
    "criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizacao" DATETIME NOT NULL,
    "portaId" INTEGER NOT NULL,
    CONSTRAINT "vulnerabilidades_portaId_fkey" FOREIGN KEY ("portaId") REFERENCES "portas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "whois_info" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rawText" TEXT NOT NULL,
    "parsed" JSONB,
    "criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizacao" DATETIME NOT NULL,
    "ipId" INTEGER NOT NULL,
    CONSTRAINT "whois_info_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ips" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "traceroute_hops" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hop" INTEGER NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "hostname" TEXT,
    "rtt1" REAL,
    "rtt2" REAL,
    "rtt3" REAL,
    "criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetIpId" INTEGER NOT NULL,
    CONSTRAINT "traceroute_hops_targetIpId_fkey" FOREIGN KEY ("targetIpId") REFERENCES "ips" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "webapp_paths" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "portaId" INTEGER NOT NULL,
    CONSTRAINT "webapp_paths_portaId_fkey" FOREIGN KEY ("portaId") REFERENCES "portas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "smb_shares" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "comment" TEXT,
    "criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipId" INTEGER NOT NULL,
    CONSTRAINT "smb_shares_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ips" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ssl_ciphers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "protocol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bits" INTEGER NOT NULL,
    "criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "portaId" INTEGER NOT NULL,
    CONSTRAINT "ssl_ciphers_portaId_fkey" FOREIGN KEY ("portaId") REFERENCES "portas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exploits" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "edbId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "portaId" INTEGER NOT NULL,
    CONSTRAINT "exploits_portaId_fkey" FOREIGN KEY ("portaId") REFERENCES "portas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "exploits_edbId_key" ON "exploits"("edbId");
