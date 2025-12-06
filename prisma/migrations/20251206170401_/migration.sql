-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_phishing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alvo" TEXT NOT NULL,
    "termo" TEXT NOT NULL,
    "fonte" TEXT NOT NULL,
    "dominioId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaVerificacao" DATETIME,
    "statusUltimaVerificacao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NECESSARIO_ANALISE',
    CONSTRAINT "phishing_dominioId_fkey" FOREIGN KEY ("dominioId") REFERENCES "dominios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_phishing" ("alvo", "criadoEm", "dominioId", "fonte", "id", "statusUltimaVerificacao", "termo", "ultimaVerificacao") SELECT "alvo", "criadoEm", "dominioId", "fonte", "id", "statusUltimaVerificacao", "termo", "ultimaVerificacao" FROM "phishing";
DROP TABLE "phishing";
ALTER TABLE "new_phishing" RENAME TO "phishing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
