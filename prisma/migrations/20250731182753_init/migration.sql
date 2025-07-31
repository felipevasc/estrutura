-- CreateTable
CREATE TABLE "projetos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizacao" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "dominios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "endereco" TEXT NOT NULL,
    "alias" TEXT,
    "projeto" INTEGER NOT NULL,
    "pai" INTEGER,
    CONSTRAINT "dominios_projeto_fkey" FOREIGN KEY ("projeto") REFERENCES "projetos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "dominios_pai_fkey" FOREIGN KEY ("pai") REFERENCES "dominios" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "redes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cidr" TEXT NOT NULL,
    "alias" TEXT,
    "projeto" INTEGER NOT NULL,
    "pai" INTEGER,
    CONSTRAINT "redes_projeto_fkey" FOREIGN KEY ("projeto") REFERENCES "projetos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "redes_pai_fkey" FOREIGN KEY ("pai") REFERENCES "dominios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
