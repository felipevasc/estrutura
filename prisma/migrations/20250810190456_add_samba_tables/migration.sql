-- CreateTable
CREATE TABLE "samba_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "rid" TEXT,
    "ipId" INTEGER NOT NULL,
    CONSTRAINT "samba_users_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ips" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "samba_shares" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "comentario" TEXT,
    "ipId" INTEGER NOT NULL,
    CONSTRAINT "samba_shares_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ips" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
