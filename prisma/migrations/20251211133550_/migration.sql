-- CreateTable
CREATE TABLE "sentinelas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "ferramenta" TEXT NOT NULL,
    "parametros" JSONB NOT NULL,
    "cron" TEXT NOT NULL,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "proximaExecucao" DATETIME,
    "ultimaExecucao" DATETIME,
    "projetoId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "sentinelas_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
