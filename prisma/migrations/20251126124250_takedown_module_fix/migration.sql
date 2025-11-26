-- CreateTable
CREATE TABLE "takedowns" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "solicitadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previsao" DATETIME NOT NULL,
    "derrubadoEm" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'SOLICITADO',
    "ultimaVerificacao" DATETIME,
    "statusUltimaVerificacao" TEXT,
    "metodoHttp" TEXT NOT NULL DEFAULT 'GET',
    "headers" TEXT,
    "body" TEXT,
    "projetoId" INTEGER NOT NULL,
    CONSTRAINT "takedowns_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "takedown_solicitantes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TakedownToTakedownSolicitante" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_TakedownToTakedownSolicitante_A_fkey" FOREIGN KEY ("A") REFERENCES "takedowns" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TakedownToTakedownSolicitante_B_fkey" FOREIGN KEY ("B") REFERENCES "takedown_solicitantes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "takedown_solicitantes_nome_key" ON "takedown_solicitantes"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "_TakedownToTakedownSolicitante_AB_unique" ON "_TakedownToTakedownSolicitante"("A", "B");

-- CreateIndex
CREATE INDEX "_TakedownToTakedownSolicitante_B_index" ON "_TakedownToTakedownSolicitante"("B");
