-- =============================================================================
-- XKWANZA — schema completo (Fases 1-7)
-- Gerado a partir das migrações Prisma (backend/prisma/migrations/).
-- Cole isto de uma só vez no SQL Editor do Supabase.
--
-- Notas importantes:
-- 1. gen_random_uuid() é nativo do PostgreSQL 13+ (Supabase usa PG15) —
--    não é necessário activar nenhuma extensão.
-- 2. Os campos "createdAt"/"updatedAt" têm DEFAULT CURRENT_TIMESTAMP, e
--    "updatedAt" é mantido automaticamente em cada UPDATE por triggers no
--    final deste ficheiro — funciona tanto via Prisma como por escrita
--    directa (Supabase Table Editor, PostgREST, SQL manual).
-- 3. Este schema não inclui Row Level Security (RLS). Se for aceder a esta
--    base de dados directamente do frontend via Supabase client (e não só
--    através do backend Express), active RLS e defina políticas antes de
--    expor as tabelas — caso contrário qualquer pessoa com a anon key lê/
--    escreve tudo. Se o acesso continuar a ser só via este backend Node
--    (service role / connection string directa), RLS é opcional.
-- =============================================================================

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUYER', 'PRODUCER', 'MERCHANT', 'TRANSPORTER', 'ADMIN', 'SUPPORT');

-- CreateEnum
CREATE TYPE "TrustLevel" AS ENUM ('LEVEL_1_CONTACT_VALIDATED', 'LEVEL_2_IDENTITY_VALIDATED', 'LEVEL_3_ACTIVITY_VALIDATED', 'LEVEL_4_DOCUMENTS_VALIDATED', 'LEVEL_5_FORMALIZATION_VALIDATED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('AGRICULTOR', 'PESCADOR', 'FABRICANTE', 'ARTESAO', 'CRIADOR', 'PRODUTOR_ALIMENTAR', 'COMERCIANTE_MERCADO', 'COMERCIANTE_RUA', 'REVENDEDOR', 'PRESTADOR_SERVICOS', 'TRANSPORTADOR', 'OUTRO');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'OUT_OF_STOCK', 'REMOVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransportStatus" AS ENUM ('REQUESTED', 'ASSIGNED', 'ACCEPTED', 'PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'PAYMENT_REFERENCE', 'WALLET', 'BANK_INTEGRATION', 'FINTECH_INTEGRATION');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('OPEN', 'PROPOSALS_RECEIVED', 'NEGOTIATING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FormalizationStatus" AS ENUM ('NOT_STARTED', 'ACTIVITY_IDENTIFIED', 'IDENTITY_VALIDATED', 'TAX_NIF_IN_PROGRESS', 'SOCIAL_SECURITY_IN_PROGRESS', 'DOCUMENTATION_IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "INSSStatus" AS ENUM ('NOT_STARTED', 'CONSENT_PENDING', 'READY', 'SUBMITTED', 'INSS_PENDING', 'VERIFIED', 'REJECTED', 'NEEDS_CORRECTION', 'SUSPENDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "INSSAdapterMode" AS ENUM ('SANDBOX', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('IDENTITY', 'DELIVERY_PROOF', 'VEHICLE_DOCUMENT', 'RECEIPT', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_ORDER', 'ORDER_ACCEPTED', 'ORDER_REJECTED', 'PAYMENT', 'TRANSPORT', 'PICKUP', 'DELIVERY', 'DOCUMENT_PENDING', 'FORMALIZATION', 'INSS', 'STATUS_CHANGE');

-- CreateEnum
CREATE TYPE "ReviewTargetType" AS ENUM ('SELLER', 'PRODUCT', 'TRANSPORTER', 'BUYER');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "province" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "activityType" "ActivityType",
    "trustLevel" "TrustLevel" NOT NULL DEFAULT 'LEVEL_1_CONTACT_VALIDATED',
    "isVerifiedBadge" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "phoneVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedBy" TEXT,
    "createdByIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "province" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "locality" TEXT,
    "reference" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "ownerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "weightKg" DECIMAL(10,3),
    "origin" TEXT,
    "province" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "averageRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_photos" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "buyerId" TEXT NOT NULL,
    "shippingAddressId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'CREATED',
    "subtotal" DECIMAL(14,2) NOT NULL,
    "transportCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_events" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "lineTotal" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "orderId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AOA',
    "custodyHeld" BOOLEAN NOT NULL DEFAULT false,
    "releasedAt" TIMESTAMP(3),
    "externalRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_status_events" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "paymentId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'AOA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "iban" TEXT,
    "accountHolder" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transporters" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "vehicleType" TEXT,
    "vehiclePlate" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "averageRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transporters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_orders" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "orderId" TEXT NOT NULL,
    "transporterId" TEXT,
    "status" "TransportStatus" NOT NULL DEFAULT 'REQUESTED',
    "proposedPrice" DECIMAL(14,2),
    "agreedPrice" DECIMAL(14,2),
    "pickupOtp" TEXT,
    "pickupAt" TIMESTAMP(3),
    "deliveryOtp" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transport_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_proposals" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "transportOrderId" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "message" TEXT,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transport_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_status_events" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "transportOrderId" TEXT NOT NULL,
    "status" "TransportStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transport_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_requests" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "requesterId" TEXT NOT NULL,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "deadline" TIMESTAMP(3),
    "status" "QuoteStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_proposals" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "quoteRequestId" TEXT NOT NULL,
    "proposerId" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "message" TEXT,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formalization_dossiers" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "status" "FormalizationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "activityType" "ActivityType",
    "businessName" TEXT,
    "province" TEXT,
    "municipality" TEXT,
    "marketLocation" TEXT,
    "nif" TEXT,
    "niss" TEXT,
    "currentStage" INTEGER NOT NULL DEFAULT 1,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formalization_dossiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formalization_diagnoses" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "dossierId" TEXT NOT NULL,
    "activityDescription" TEXT NOT NULL,
    "workLocation" TEXT NOT NULL,
    "hasNif" BOOLEAN NOT NULL,
    "hasInss" BOOLEAN NOT NULL,
    "worksAlone" BOOLEAN NOT NULL,
    "hasHelpers" BOOLEAN NOT NULL,
    "sellsInMarket" BOOLEAN NOT NULL,
    "worksOnStreet" BOOLEAN NOT NULL,
    "worksFromHome" BOOLEAN NOT NULL,
    "worksOnFarm" BOOLEAN NOT NULL,
    "doesDeliveries" BOOLEAN NOT NULL,
    "usesOwnVehicle" BOOLEAN NOT NULL,
    "suggestedNextStep" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formalization_diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formalization_stages" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "dossierId" TEXT NOT NULL,
    "stageNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formalization_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inss_linkages" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "niss" TEXT,
    "status" "INSSStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "adapterMode" "INSSAdapterMode" NOT NULL DEFAULT 'SANDBOX',
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inss_linkages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inss_consents" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "linkageId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "authorizedData" TEXT[],
    "version" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "origin" TEXT NOT NULL,
    "ipAddress" TEXT,

    CONSTRAINT "inss_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inss_sync_events" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "linkageId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB,
    "adapterMode" "INSSAdapterMode" NOT NULL,
    "success" BOOLEAN NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inss_sync_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inss_documents" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "linkageId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "inss_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inss_simulations" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "linkageId" TEXT NOT NULL,
    "declaredBase" DECIMAL(14,2) NOT NULL,
    "contributionRate" DECIMAL(5,2) NOT NULL,
    "monthlyContribution" DECIMAL(14,2) NOT NULL,
    "annualContribution" DECIMAL(14,2) NOT NULL,
    "regime" TEXT NOT NULL,
    "isSimulationOnly" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inss_simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "ownerId" TEXT NOT NULL,
    "dossierId" TEXT,
    "type" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "validUntil" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "authorId" TEXT NOT NULL,
    "targetType" "ReviewTargetType" NOT NULL,
    "targetUserId" TEXT,
    "productId" TEXT,
    "orderId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "requesterId" TEXT NOT NULL,
    "agentId" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "result" TEXT NOT NULL,
    "ipAddress" TEXT,
    "origin" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_province_municipality_idx" ON "users"("province", "municipality");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "products_ownerId_idx" ON "products"("ownerId");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "product_photos_productId_idx" ON "product_photos"("productId");

-- CreateIndex
CREATE INDEX "orders_buyerId_idx" ON "orders"("buyerId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "order_status_events_orderId_idx" ON "order_status_events"("orderId");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_orderId_key" ON "payments"("orderId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payment_status_events_paymentId_idx" ON "payment_status_events"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE INDEX "bank_accounts_userId_idx" ON "bank_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "transporters_userId_key" ON "transporters"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "transport_orders_orderId_key" ON "transport_orders"("orderId");

-- CreateIndex
CREATE INDEX "transport_orders_status_idx" ON "transport_orders"("status");

-- CreateIndex
CREATE INDEX "transport_orders_transporterId_idx" ON "transport_orders"("transporterId");

-- CreateIndex
CREATE INDEX "transport_proposals_transportOrderId_idx" ON "transport_proposals"("transportOrderId");

-- CreateIndex
CREATE INDEX "transport_proposals_transporterId_idx" ON "transport_proposals"("transporterId");

-- CreateIndex
CREATE INDEX "transport_status_events_transportOrderId_idx" ON "transport_status_events"("transportOrderId");

-- CreateIndex
CREATE INDEX "quote_requests_requesterId_idx" ON "quote_requests"("requesterId");

-- CreateIndex
CREATE INDEX "quote_requests_status_idx" ON "quote_requests"("status");

-- CreateIndex
CREATE INDEX "quote_proposals_quoteRequestId_idx" ON "quote_proposals"("quoteRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "formalization_dossiers_userId_key" ON "formalization_dossiers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "formalization_diagnoses_dossierId_key" ON "formalization_diagnoses"("dossierId");

-- CreateIndex
CREATE INDEX "formalization_stages_dossierId_idx" ON "formalization_stages"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "inss_linkages_userId_key" ON "inss_linkages"("userId");

-- CreateIndex
CREATE INDEX "inss_consents_linkageId_idx" ON "inss_consents"("linkageId");

-- CreateIndex
CREATE INDEX "inss_sync_events_linkageId_idx" ON "inss_sync_events"("linkageId");

-- CreateIndex
CREATE INDEX "inss_documents_linkageId_idx" ON "inss_documents"("linkageId");

-- CreateIndex
CREATE INDEX "inss_simulations_linkageId_idx" ON "inss_simulations"("linkageId");

-- CreateIndex
CREATE INDEX "documents_ownerId_idx" ON "documents"("ownerId");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "reviews_targetUserId_idx" ON "reviews"("targetUserId");

-- CreateIndex
CREATE INDEX "reviews_productId_idx" ON "reviews"("productId");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_photos" ADD CONSTRAINT "product_photos_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_status_events" ADD CONSTRAINT "payment_status_events_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transporters" ADD CONSTRAINT "transporters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_orders" ADD CONSTRAINT "transport_orders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_orders" ADD CONSTRAINT "transport_orders_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "transporters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_proposals" ADD CONSTRAINT "transport_proposals_transportOrderId_fkey" FOREIGN KEY ("transportOrderId") REFERENCES "transport_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_proposals" ADD CONSTRAINT "transport_proposals_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "transporters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_status_events" ADD CONSTRAINT "transport_status_events_transportOrderId_fkey" FOREIGN KEY ("transportOrderId") REFERENCES "transport_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_proposals" ADD CONSTRAINT "quote_proposals_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_proposals" ADD CONSTRAINT "quote_proposals_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formalization_dossiers" ADD CONSTRAINT "formalization_dossiers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formalization_diagnoses" ADD CONSTRAINT "formalization_diagnoses_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "formalization_dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formalization_stages" ADD CONSTRAINT "formalization_stages_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "formalization_dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inss_linkages" ADD CONSTRAINT "inss_linkages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inss_consents" ADD CONSTRAINT "inss_consents_linkageId_fkey" FOREIGN KEY ("linkageId") REFERENCES "inss_linkages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inss_sync_events" ADD CONSTRAINT "inss_sync_events_linkageId_fkey" FOREIGN KEY ("linkageId") REFERENCES "inss_linkages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inss_documents" ADD CONSTRAINT "inss_documents_linkageId_fkey" FOREIGN KEY ("linkageId") REFERENCES "inss_linkages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inss_simulations" ADD CONSTRAINT "inss_simulations_linkageId_fkey" FOREIGN KEY ("linkageId") REFERENCES "inss_linkages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "formalization_dossiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migração adicional: constraint única em falta (dossierId, stageNumber)
-- DropIndex
DROP INDEX "formalization_stages_dossierId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "formalization_stages_dossierId_stageNumber_key" ON "formalization_stages"("dossierId", "stageNumber");

-- ─────────────────────────────────────────────────────────────────────────
-- updatedAt automático — DEFAULT CURRENT_TIMESTAMP cobre o INSERT; este
-- trigger cobre o UPDATE. O Prisma já define updatedAt a partir da
-- aplicação, mas isto garante o mesmo comportamento para quem escrever
-- directamente na base de dados (Supabase Table Editor, PostgREST, SQL
-- manual, etc), sem depender do backend.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON "users"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_addresses_updated_at
BEFORE UPDATE ON "addresses"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON "products"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON "orders"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_payments_updated_at
BEFORE UPDATE ON "payments"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_wallets_updated_at
BEFORE UPDATE ON "wallets"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_transporters_updated_at
BEFORE UPDATE ON "transporters"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_transport_orders_updated_at
BEFORE UPDATE ON "transport_orders"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_quote_requests_updated_at
BEFORE UPDATE ON "quote_requests"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_formalization_dossiers_updated_at
BEFORE UPDATE ON "formalization_dossiers"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_inss_linkages_updated_at
BEFORE UPDATE ON "inss_linkages"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_support_tickets_updated_at
BEFORE UPDATE ON "support_tickets"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
