-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateEnum
CREATE TYPE "DeliveryOption" AS ENUM ('SELLER_DELIVERS', 'BUYER_PICKUP', 'XKWANZA_TRANSPORT');

-- AlterTable
ALTER TABLE "products"
  ALTER COLUMN "unit" DROP NOT NULL,
  ALTER COLUMN "stock" DROP NOT NULL,
  ALTER COLUMN "stock" DROP DEFAULT,
  ALTER COLUMN "province" DROP NOT NULL,
  ALTER COLUMN "municipality" DROP NOT NULL,
  ADD COLUMN "listingType" "ListingType" NOT NULL DEFAULT 'PRODUCT',
  ADD COLUMN "isEstimatedPrice" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "deliveryOption" "DeliveryOption",
  ADD COLUMN "serviceArea" TEXT,
  ADD COLUMN "availability" TEXT,
  ADD COLUMN "contact" TEXT;

-- CreateIndex
CREATE INDEX "products_listingType_idx" ON "products"("listingType");
