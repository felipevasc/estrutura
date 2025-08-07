/*
  Warnings:

  - A unique constraint covering the columns `[numero,protocolo,ipId]` on the table `portas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,ipId]` on the table `smb_shares` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,portaId]` on the table `ssl_ciphers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[titulo,portaId]` on the table `vulnerabilidades` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[path,portaId]` on the table `webapp_paths` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "portas_numero_protocolo_ipId_key" ON "portas"("numero", "protocolo", "ipId");

-- CreateIndex
CREATE UNIQUE INDEX "smb_shares_name_ipId_key" ON "smb_shares"("name", "ipId");

-- CreateIndex
CREATE UNIQUE INDEX "ssl_ciphers_name_portaId_key" ON "ssl_ciphers"("name", "portaId");

-- CreateIndex
CREATE UNIQUE INDEX "vulnerabilidades_titulo_portaId_key" ON "vulnerabilidades"("titulo", "portaId");

-- CreateIndex
CREATE UNIQUE INDEX "webapp_paths_path_portaId_key" ON "webapp_paths"("path", "portaId");
