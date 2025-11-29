-- CreateTable
CREATE TABLE "whatweb_resultados" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assinatura" TEXT NOT NULL,
    "plugin" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "dados" JSONB,
    "dominioId" INTEGER,
    "ipId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "whatweb_resultados_dominioId_fkey" FOREIGN KEY ("dominioId") REFERENCES "dominios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "whatweb_resultados_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ips" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "whatweb_resultados_assinatura_key" ON "whatweb_resultados"("assinatura");
