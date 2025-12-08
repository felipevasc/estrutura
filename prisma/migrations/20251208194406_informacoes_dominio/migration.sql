-- CreateTable
CREATE TABLE "informacoes_dominio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "campo" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "dominioId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "informacoes_dominio_dominioId_fkey" FOREIGN KEY ("dominioId") REFERENCES "dominios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "informacoes_dominio_dominioId_campo_key" ON "informacoes_dominio"("dominioId", "campo");
