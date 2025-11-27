-- CreateTable
CREATE TABLE "fontes_vazamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "parametros" JSONB NOT NULL,
    "observacoes" TEXT,
    "projetoId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "fontes_vazamento_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "busca_ativa_telegram" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fonteId" INTEGER NOT NULL,
    "extensoes" JSONB NOT NULL,
    "ultimaCapturaSucesso" DATETIME,
    "destinoCentral" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "busca_ativa_telegram_fonteId_fkey" FOREIGN KEY ("fonteId") REFERENCES "fontes_vazamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "busca_ativa_telegram_fonteId_key" ON "busca_ativa_telegram"("fonteId");
