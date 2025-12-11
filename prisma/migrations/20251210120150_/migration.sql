-- AlterTable
ALTER TABLE "diretorios" ADD COLUMN "captura" TEXT;
ALTER TABLE "diretorios" ADD COLUMN "capturadoEm" DATETIME;

-- AlterTable
ALTER TABLE "dominios" ADD COLUMN "captura" TEXT;
ALTER TABLE "dominios" ADD COLUMN "capturadoEm" DATETIME;

-- AlterTable
ALTER TABLE "portas" ADD COLUMN "captura" TEXT;
ALTER TABLE "portas" ADD COLUMN "capturadoEm" DATETIME;
