-- CreateTable
CREATE TABLE "phishing_catcher_configuracoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "palavras" JSONB NOT NULL,
    "tlds" JSONB NOT NULL,
    "dominioId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "phishing_catcher_configuracoes_dominioId_fkey" FOREIGN KEY ("dominioId") REFERENCES "dominios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "phishing_catcher_configuracoes_dominioId_key" ON "phishing_catcher_configuracoes"("dominioId");
