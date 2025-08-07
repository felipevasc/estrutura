-- CreateTable
CREATE TABLE "ips" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "endereco" TEXT NOT NULL,
    "projetoId" INTEGER NOT NULL,
    CONSTRAINT "ips_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Execucao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projetoId" INTEGER NOT NULL,
    "comando" TEXT NOT NULL,
    "argumentos" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AGUARDANDO',
    "caminho_saida" TEXT,
    "mensagem_erro" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "Execucao_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_DominioToIp" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_DominioToIp_A_fkey" FOREIGN KEY ("A") REFERENCES "dominios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DominioToIp_B_fkey" FOREIGN KEY ("B") REFERENCES "ips" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_IpToRede" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_IpToRede_A_fkey" FOREIGN KEY ("A") REFERENCES "ips" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_IpToRede_B_fkey" FOREIGN KEY ("B") REFERENCES "redes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_DominioToIp_AB_unique" ON "_DominioToIp"("A", "B");

-- CreateIndex
CREATE INDEX "_DominioToIp_B_index" ON "_DominioToIp"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_IpToRede_AB_unique" ON "_IpToRede"("A", "B");

-- CreateIndex
CREATE INDEX "_IpToRede_B_index" ON "_IpToRede"("B");
