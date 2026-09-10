-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'ACTIVITY_PROOF';

-- CreateEnum
CREATE TYPE "SelfDeclaredFormalizationState" AS ENUM ('INFORMAL', 'EM_FORMALIZACAO', 'FORMALIZADO');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "locality" TEXT,
ADD COLUMN     "avatarUrl" TEXT;

-- CreateTable
CREATE TABLE "producer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productionLocation" TEXT,
    "businessName" TEXT,
    "productCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "productsProduced" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "productionCapacity" TEXT,
    "productionUnit" TEXT,
    "referencePrice" TEXT,
    "availability" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT,
    "businessLocation" TEXT,
    "productCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "productsSold" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "formalizationState" "SelfDeclaredFormalizationState" NOT NULL DEFAULT 'INFORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "producer_profiles_userId_key" ON "producer_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_profiles_userId_key" ON "merchant_profiles"("userId");

-- AddForeignKey
ALTER TABLE "producer_profiles" ADD CONSTRAINT "producer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_profiles" ADD CONSTRAINT "merchant_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
