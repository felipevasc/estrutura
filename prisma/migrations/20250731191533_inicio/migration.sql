/*
  Warnings:

  - You are about to drop the column `pai` on the `dominios` table. All the data in the column will be lost.
  - You are about to drop the column `projeto` on the `dominios` table. All the data in the column will be lost.
  - You are about to drop the column `pai` on the `redes` table. All the data in the column will be lost.
  - You are about to drop the column `projeto` on the `redes` table. All the data in the column will be lost.
  - Added the required column `projetoId` to the `dominios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projetoId` to the `redes` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_dominios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "endereco" TEXT NOT NULL,
    "alias" TEXT,
    "projetoId" INTEGER NOT NULL,
    "paiId" INTEGER,
    CONSTRAINT "dominios_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "dominios_paiId_fkey" FOREIGN KEY ("paiId") REFERENCES "dominios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_dominios" ("alias", "endereco", "id") SELECT "alias", "endereco", "id" FROM "dominios";
DROP TABLE "dominios";
ALTER TABLE "new_dominios" RENAME TO "dominios";
CREATE TABLE "new_redes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cidr" TEXT NOT NULL,
    "alias" TEXT,
    "projetoId" INTEGER NOT NULL,
    "paiId" INTEGER,
    CONSTRAINT "redes_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "redes_paiId_fkey" FOREIGN KEY ("paiId") REFERENCES "redes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_redes" ("alias", "cidr", "id") SELECT "alias", "cidr", "id" FROM "redes";
DROP TABLE "redes";
ALTER TABLE "new_redes" RENAME TO "redes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
