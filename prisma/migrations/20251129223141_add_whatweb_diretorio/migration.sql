-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_whatweb_resultados" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assinatura" TEXT NOT NULL,
    "plugin" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "dados" JSONB,
    "dominioId" INTEGER,
    "ipId" INTEGER,
    "diretorioId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "whatweb_resultados_dominioId_fkey" FOREIGN KEY ("dominioId") REFERENCES "dominios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "whatweb_resultados_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ips" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "whatweb_resultados_diretorioId_fkey" FOREIGN KEY ("diretorioId") REFERENCES "diretorios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_whatweb_resultados" ("assinatura", "criadoEm", "dados", "dominioId", "id", "ipId", "plugin", "valor") SELECT "assinatura", "criadoEm", "dados", "dominioId", "id", "ipId", "plugin", "valor" FROM "whatweb_resultados";
DROP TABLE "whatweb_resultados";
ALTER TABLE "new_whatweb_resultados" RENAME TO "whatweb_resultados";
CREATE UNIQUE INDEX "whatweb_resultados_assinatura_key" ON "whatweb_resultados"("assinatura");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
