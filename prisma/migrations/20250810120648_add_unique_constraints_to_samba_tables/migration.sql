-- CreateIndex
CREATE UNIQUE INDEX "samba_users_nome_ipId_key" ON "samba_users"("nome", "ipId");

-- CreateIndex
CREATE UNIQUE INDEX "samba_shares_nome_ipId_key" ON "samba_shares"("nome", "ipId");
