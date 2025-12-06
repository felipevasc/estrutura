-- CreateTable
CREATE TABLE "auxiliares_phishing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termo" TEXT NOT NULL,
    "dominioId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auxiliares_phishing_dominioId_fkey" FOREIGN KEY ("dominioId") REFERENCES "dominios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "auxiliares_phishing_termo_dominioId_key" ON "auxiliares_phishing"("termo", "dominioId");
