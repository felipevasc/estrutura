-- CreateTable
CREATE TABLE "phishing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alvo" TEXT NOT NULL,
    "termo" TEXT NOT NULL,
    "fonte" TEXT NOT NULL,
    "dominioId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "phishing_dominioId_fkey" FOREIGN KEY ("dominioId") REFERENCES "dominios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "termos_phishing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termo" TEXT NOT NULL,
    "dominioId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "termos_phishing_dominioId_fkey" FOREIGN KEY ("dominioId") REFERENCES "dominios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "termos_phishing_termo_dominioId_key" ON "termos_phishing"("termo", "dominioId");
