-- CreateTable
CREATE TABLE "tlds_phishing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tld" TEXT NOT NULL,
    "dominioId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tlds_phishing_dominioId_fkey" FOREIGN KEY ("dominioId") REFERENCES "dominios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tlds_phishing_tld_dominioId_key" ON "tlds_phishing"("tld", "dominioId");
