-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_dominios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "endereco" TEXT NOT NULL,
    "alias" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'principal',
    "projetoId" INTEGER NOT NULL,
    "paiId" INTEGER,
    CONSTRAINT "dominios_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "dominios_paiId_fkey" FOREIGN KEY ("paiId") REFERENCES "dominios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_dominios" ("alias", "endereco", "id", "paiId", "projetoId") SELECT "alias", "endereco", "id", "paiId", "projetoId" FROM "dominios";
DROP TABLE "dominios";
ALTER TABLE "new_dominios" RENAME TO "dominios";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
