-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "projetoId" INTEGER NOT NULL,
    "criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizacao" DATETIME NOT NULL,
    CONSTRAINT "usuarios_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_IpToUsuario" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_IpToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "ips" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_IpToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_IpToUsuario_AB_unique" ON "_IpToUsuario"("A", "B");

-- CreateIndex
CREATE INDEX "_IpToUsuario_B_index" ON "_IpToUsuario"("B");
