CREATE TABLE "projetos" (
	"id"	INTEGER NOT NULL,
	"nome"	TEXT NOT NULL,
	"criacao"	INTEGER,
	"atualizacao"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "dominios" (
    "id" INTEGER NOT NULL,
    "endereco" TEXT NOT NULL,
    "alias" TEXT,
    "projeto" INTEGER NOT NULL,
    "pai" INTEGER,
    FOREIGN KEY("projeto") REFERENCES projetos(id),
    FOREIGN KEY ("pai") REFERENCES dominios("id")
    PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "redes" (
    "id" INTEGER NOT NULL,
    "cidr" TEXT NOT NULL,
    "alias" TEXT,
    "projeto" INTEGER NOT NULL,
    "pai" INTEGER,
    FOREIGN KEY("projeto") REFERENCES projetos(id),
    FOREIGN KEY ("pai") REFERENCES dominios("id")
    PRIMARY KEY("id" AUTOINCREMENT)
);