-- AlterTable
ALTER TABLE "users" ADD COLUMN "nif" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_nif_key" ON "users"("nif");
