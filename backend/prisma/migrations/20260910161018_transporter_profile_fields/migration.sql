-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'SERVICE_REQUIREMENT';

-- CreateEnum
CREATE TYPE "TransporterCategory" AS ENUM ('INDIVIDUAL', 'EMPRESA');

-- AlterTable
ALTER TABLE "transporters" ADD COLUMN     "transporterCategory" "TransporterCategory",
ADD COLUMN     "cargoCapacity" TEXT,
ADD COLUMN     "cargoType" TEXT,
ADD COLUMN     "serviceAreas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "servicePrice" TEXT;
