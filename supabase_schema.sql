-- =============================================================================
-- AO MARKET — schema completo
-- Gerado a partir de todas as migrações Prisma aplicadas até hoje
-- (backend/prisma/migrations/), replicadas numa base de dados Postgres
-- limpa e depois extraídas com pg_dump --schema-only, para garantir fidelidade
-- ao estado real da base de dados (e não apenas ao schema.prisma).
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
-- 4. Não existe tabela de carteira/saldo (wallet) — os pagamentos vivem
--    inteiramente em "payments", associados a "orders".
-- =============================================================================

-- Name: ActivityType; Type: TYPE

CREATE TYPE "ActivityType" AS ENUM (
    'AGRICULTOR',
    'PESCADOR',
    'FABRICANTE',
    'ARTESAO',
    'CRIADOR',
    'PRODUTOR_ALIMENTAR',
    'COMERCIANTE_MERCADO',
    'COMERCIANTE_RUA',
    'REVENDEDOR',
    'PRESTADOR_SERVICOS',
    'TRANSPORTADOR',
    'OUTRO'
);

-- Name: ComplaintStatus; Type: TYPE

CREATE TYPE "ComplaintStatus" AS ENUM (
    'OPEN',
    'UNDER_REVIEW',
    'RESOLVED',
    'REJECTED'
);

-- Name: ComplaintTargetType; Type: TYPE

CREATE TYPE "ComplaintTargetType" AS ENUM (
    'ORDER',
    'PRODUCT',
    'USER',
    'TRANSPORT_ORDER',
    'OTHER'
);

-- Name: DeliveryOption; Type: TYPE

CREATE TYPE "DeliveryOption" AS ENUM (
    'SELLER_DELIVERS',
    'BUYER_PICKUP',
    'AO_MARKET_TRANSPORT'
);

-- Name: DocumentStatus; Type: TYPE

CREATE TYPE "DocumentStatus" AS ENUM (
    'PENDING',
    'UNDER_REVIEW',
    'VERIFIED',
    'REJECTED'
);

-- Name: DocumentType; Type: TYPE

CREATE TYPE "DocumentType" AS ENUM (
    'IDENTITY',
    'DELIVERY_PROOF',
    'VEHICLE_DOCUMENT',
    'RECEIPT',
    'OTHER',
    'SERVICE_REQUIREMENT',
    'ACTIVITY_PROOF'
);

-- Name: FormalizationStatus; Type: TYPE

CREATE TYPE "FormalizationStatus" AS ENUM (
    'NOT_STARTED',
    'ACTIVITY_IDENTIFIED',
    'IDENTITY_VALIDATED',
    'TAX_NIF_IN_PROGRESS',
    'SOCIAL_SECURITY_IN_PROGRESS',
    'DOCUMENTATION_IN_PROGRESS',
    'COMPLETED'
);

-- Name: INSSAdapterMode; Type: TYPE

CREATE TYPE "INSSAdapterMode" AS ENUM (
    'SANDBOX',
    'PRODUCTION'
);

-- Name: INSSStatus; Type: TYPE

CREATE TYPE "INSSStatus" AS ENUM (
    'NOT_STARTED',
    'CONSENT_PENDING',
    'READY',
    'SUBMITTED',
    'INSS_PENDING',
    'VERIFIED',
    'REJECTED',
    'NEEDS_CORRECTION',
    'SUSPENDED',
    'EXPIRED'
);

-- Name: ListingType; Type: TYPE

CREATE TYPE "ListingType" AS ENUM (
    'PRODUCT',
    'SERVICE'
);

-- Name: NotificationChannel; Type: TYPE

CREATE TYPE "NotificationChannel" AS ENUM (
    'IN_APP',
    'EMAIL',
    'PUSH'
);

-- Name: NotificationType; Type: TYPE

CREATE TYPE "NotificationType" AS ENUM (
    'NEW_ORDER',
    'ORDER_ACCEPTED',
    'ORDER_REJECTED',
    'PAYMENT',
    'TRANSPORT',
    'PICKUP',
    'DELIVERY',
    'DOCUMENT_PENDING',
    'FORMALIZATION',
    'INSS',
    'STATUS_CHANGE',
    'SUPPORT',
    'QUOTE'
);

-- Name: OrderStatus; Type: TYPE

CREATE TYPE "OrderStatus" AS ENUM (
    'CREATED',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED'
);

-- Name: PaymentMethod; Type: TYPE

CREATE TYPE "PaymentMethod" AS ENUM (
    'BANK_TRANSFER',
    'PAYMENT_REFERENCE',
    'WALLET',
    'BANK_INTEGRATION',
    'FINTECH_INTEGRATION'
);

-- Name: PaymentStatus; Type: TYPE

CREATE TYPE "PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'PAID',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
);

-- Name: ProductStatus; Type: TYPE

CREATE TYPE "ProductStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'UNPUBLISHED',
    'OUT_OF_STOCK',
    'REMOVED'
);

-- Name: ProfileVerificationStatus; Type: TYPE

CREATE TYPE "ProfileVerificationStatus" AS ENUM (
    'NONE',
    'PENDING',
    'APPROVED',
    'REJECTED'
);

-- Name: QuoteStatus; Type: TYPE

CREATE TYPE "QuoteStatus" AS ENUM (
    'OPEN',
    'PROPOSALS_RECEIVED',
    'NEGOTIATING',
    'ACCEPTED',
    'EXPIRED',
    'CANCELLED'
);

-- Name: ReviewTargetType; Type: TYPE

CREATE TYPE "ReviewTargetType" AS ENUM (
    'SELLER',
    'PRODUCT',
    'TRANSPORTER',
    'BUYER'
);

-- Name: RouteStatus; Type: TYPE

CREATE TYPE "RouteStatus" AS ENUM (
    'PLANNED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);

-- Name: RouteStopStatus; Type: TYPE

CREATE TYPE "RouteStopStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'SKIPPED'
);

-- Name: SelfDeclaredFormalizationState; Type: TYPE

CREATE TYPE "SelfDeclaredFormalizationState" AS ENUM (
    'INFORMAL',
    'EM_FORMALIZACAO',
    'FORMALIZADO'
);

-- Name: SupportTicketStatus; Type: TYPE

CREATE TYPE "SupportTicketStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'WAITING_ON_USER',
    'RESOLVED',
    'CLOSED'
);

-- Name: TransportStatus; Type: TYPE

CREATE TYPE "TransportStatus" AS ENUM (
    'REQUESTED',
    'ASSIGNED',
    'ACCEPTED',
    'PICKUP',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED'
);

-- Name: TransporterCategory; Type: TYPE

CREATE TYPE "TransporterCategory" AS ENUM (
    'INDIVIDUAL',
    'EMPRESA'
);

-- Name: TrustLevel; Type: TYPE

CREATE TYPE "TrustLevel" AS ENUM (
    'LEVEL_1_CONTACT_VALIDATED',
    'LEVEL_2_IDENTITY_VALIDATED',
    'LEVEL_3_ACTIVITY_VALIDATED',
    'LEVEL_4_DOCUMENTS_VALIDATED',
    'LEVEL_5_FORMALIZATION_VALIDATED'
);

-- Name: UserRole; Type: TYPE

CREATE TYPE "UserRole" AS ENUM (
    'BUYER',
    'PRODUCER',
    'MERCHANT',
    'TRANSPORTER',
    'ADMIN',
    'SUPPORT'
);

-- Name: addresses; Type: TABLE

CREATE TABLE addresses (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    label text,
    province text NOT NULL,
    municipality text NOT NULL,
    locality text,
    reference text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: audit_logs; Type: TABLE

CREATE TABLE audit_logs (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "userId" text,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    result text NOT NULL,
    "ipAddress" text,
    origin text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: bank_accounts; Type: TABLE

CREATE TABLE bank_accounts (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    "bankName" text NOT NULL,
    iban text,
    "accountHolder" text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: banners; Type: TABLE

CREATE TABLE banners (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "imageUrl" text NOT NULL,
    title text,
    subtitle text,
    "ctaLabel" text,
    "ctaTo" text,
    "position" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: categories; Type: TABLE

CREATE TABLE categories (
    id text NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL,
    "parentId" text
);

-- Name: complaint_messages; Type: TABLE

CREATE TABLE complaint_messages (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "complaintId" text NOT NULL,
    "authorId" text NOT NULL,
    body text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: complaints; Type: TABLE

CREATE TABLE complaints (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "complainantId" text NOT NULL,
    "agentId" text,
    "targetType" "ComplaintTargetType" DEFAULT 'OTHER'::"ComplaintTargetType" NOT NULL,
    "targetId" text,
    subject text NOT NULL,
    description text NOT NULL,
    status "ComplaintStatus" DEFAULT 'OPEN'::"ComplaintStatus" NOT NULL,
    "resolutionNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: conversation_messages; Type: TABLE

CREATE TABLE conversation_messages (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "conversationId" text NOT NULL,
    "authorId" text NOT NULL,
    body text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: conversations; Type: TABLE

CREATE TABLE conversations (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "participantOneId" text NOT NULL,
    "participantTwoId" text NOT NULL,
    "contextOrderId" text,
    "contextProductId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: documents; Type: TABLE

CREATE TABLE documents (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "ownerId" text NOT NULL,
    "dossierId" text,
    type "DocumentType" NOT NULL,
    "fileUrl" text NOT NULL,
    status "DocumentStatus" DEFAULT 'PENDING'::"DocumentStatus" NOT NULL,
    "validUntil" timestamp(3) without time zone,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "verifiedBy" text
);

-- Name: favorites; Type: TABLE

CREATE TABLE favorites (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: formalization_diagnoses; Type: TABLE

CREATE TABLE formalization_diagnoses (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "dossierId" text NOT NULL,
    "activityDescription" text NOT NULL,
    "workLocation" text NOT NULL,
    "hasNif" boolean NOT NULL,
    "hasInss" boolean NOT NULL,
    "worksAlone" boolean NOT NULL,
    "hasHelpers" boolean NOT NULL,
    "sellsInMarket" boolean NOT NULL,
    "worksOnStreet" boolean NOT NULL,
    "worksFromHome" boolean NOT NULL,
    "worksOnFarm" boolean NOT NULL,
    "doesDeliveries" boolean NOT NULL,
    "usesOwnVehicle" boolean NOT NULL,
    "suggestedNextStep" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: formalization_dossiers; Type: TABLE

CREATE TABLE formalization_dossiers (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    status "FormalizationStatus" DEFAULT 'NOT_STARTED'::"FormalizationStatus" NOT NULL,
    "activityType" "ActivityType",
    "businessName" text,
    province text,
    municipality text,
    "marketLocation" text,
    nif text,
    niss text,
    "currentStage" integer DEFAULT 1 NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: formalization_stages; Type: TABLE

CREATE TABLE formalization_stages (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "dossierId" text NOT NULL,
    "stageNumber" integer NOT NULL,
    name text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    "completedAt" timestamp(3) without time zone,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: inss_consents; Type: TABLE

CREATE TABLE inss_consents (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "linkageId" text NOT NULL,
    purpose text NOT NULL,
    "authorizedData" text[],
    version text NOT NULL,
    "grantedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "revokedAt" timestamp(3) without time zone,
    origin text NOT NULL,
    "ipAddress" text
);

-- Name: inss_documents; Type: TABLE

CREATE TABLE inss_documents (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "linkageId" text NOT NULL,
    type "DocumentType" NOT NULL,
    "fileUrl" text NOT NULL,
    status "DocumentStatus" DEFAULT 'PENDING'::"DocumentStatus" NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "verifiedAt" timestamp(3) without time zone
);

-- Name: inss_linkages; Type: TABLE

CREATE TABLE inss_linkages (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    niss text,
    status "INSSStatus" DEFAULT 'NOT_STARTED'::"INSSStatus" NOT NULL,
    "adapterMode" "INSSAdapterMode" DEFAULT 'SANDBOX'::"INSSAdapterMode" NOT NULL,
    "lastSyncedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: inss_simulations; Type: TABLE

CREATE TABLE inss_simulations (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "linkageId" text NOT NULL,
    "declaredBase" numeric(14,2) NOT NULL,
    "contributionRate" numeric(5,2) NOT NULL,
    "monthlyContribution" numeric(14,2) NOT NULL,
    "annualContribution" numeric(14,2) NOT NULL,
    regime text NOT NULL,
    "isSimulationOnly" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: inss_sync_events; Type: TABLE

CREATE TABLE inss_sync_events (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "linkageId" text NOT NULL,
    "eventType" text NOT NULL,
    payload jsonb,
    "adapterMode" "INSSAdapterMode" NOT NULL,
    success boolean NOT NULL,
    message text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: merchant_profiles; Type: TABLE

CREATE TABLE merchant_profiles (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    "businessName" text,
    "businessLocation" text,
    "productCategories" text[] DEFAULT ARRAY[]::text[],
    "productsSold" text[] DEFAULT ARRAY[]::text[],
    "formalizationState" "SelfDeclaredFormalizationState" DEFAULT 'INFORMAL'::"SelfDeclaredFormalizationState" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: notifications; Type: TABLE

CREATE TABLE notifications (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    type "NotificationType" NOT NULL,
    channel "NotificationChannel" NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: order_items; Type: TABLE

CREATE TABLE order_items (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(14,2) NOT NULL,
    "lineTotal" numeric(14,2) NOT NULL
);

-- Name: order_status_events; Type: TABLE

CREATE TABLE order_status_events (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "orderId" text NOT NULL,
    status "OrderStatus" NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: orders; Type: TABLE

CREATE TABLE orders (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "buyerId" text NOT NULL,
    "shippingAddressId" text NOT NULL,
    status "OrderStatus" DEFAULT 'CREATED'::"OrderStatus" NOT NULL,
    subtotal numeric(14,2) NOT NULL,
    "transportCost" numeric(14,2) DEFAULT 0 NOT NULL,
    total numeric(14,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: payment_status_events; Type: TABLE

CREATE TABLE payment_status_events (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "paymentId" text NOT NULL,
    status "PaymentStatus" NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: payments; Type: TABLE

CREATE TABLE payments (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "orderId" text NOT NULL,
    method "PaymentMethod" NOT NULL,
    status "PaymentStatus" DEFAULT 'PENDING'::"PaymentStatus" NOT NULL,
    amount numeric(14,2) NOT NULL,
    currency text DEFAULT 'AOA'::text NOT NULL,
    "custodyHeld" boolean DEFAULT false NOT NULL,
    "releasedAt" timestamp(3) without time zone,
    "externalRef" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: platform_settings; Type: TABLE

CREATE TABLE platform_settings (
    key text NOT NULL,
    value text NOT NULL,
    "updatedById" text,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: producer_profiles; Type: TABLE

CREATE TABLE producer_profiles (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    "productionLocation" text,
    "businessName" text,
    "productCategories" text[] DEFAULT ARRAY[]::text[],
    "productsProduced" text[] DEFAULT ARRAY[]::text[],
    "productionCapacity" text,
    "productionUnit" text,
    "referencePrice" text,
    availability text,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: product_photos; Type: TABLE

CREATE TABLE product_photos (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "productId" text NOT NULL,
    url text NOT NULL,
    "uploadedComplete" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: products; Type: TABLE

CREATE TABLE products (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "ownerId" text NOT NULL,
    "categoryId" text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price numeric(14,2) NOT NULL,
    unit text,
    stock integer,
    "weightKg" numeric(10,3),
    origin text,
    province text,
    municipality text,
    status "ProductStatus" DEFAULT 'DRAFT'::"ProductStatus" NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "averageRating" numeric(3,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingType" "ListingType" DEFAULT 'PRODUCT'::"ListingType" NOT NULL,
    "isEstimatedPrice" boolean DEFAULT false NOT NULL,
    "deliveryOption" "DeliveryOption",
    "serviceArea" text,
    availability text,
    contact text
);

-- Name: quote_proposals; Type: TABLE

CREATE TABLE quote_proposals (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "quoteRequestId" text NOT NULL,
    "proposerId" text NOT NULL,
    price numeric(14,2) NOT NULL,
    message text,
    accepted boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: quote_requests; Type: TABLE

CREATE TABLE quote_requests (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "requesterId" text NOT NULL,
    "productId" text,
    description text NOT NULL,
    quantity numeric(14,3) NOT NULL,
    deadline timestamp(3) without time zone,
    status "QuoteStatus" DEFAULT 'OPEN'::"QuoteStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: refresh_tokens; Type: TABLE

CREATE TABLE refresh_tokens (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "replacedBy" text,
    "createdByIp" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: reviews; Type: TABLE

CREATE TABLE reviews (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "authorId" text NOT NULL,
    "targetType" "ReviewTargetType" NOT NULL,
    "targetUserId" text,
    "productId" text,
    "orderId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: route_stops; Type: TABLE

CREATE TABLE route_stops (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "routeId" text NOT NULL,
    "transportOrderId" text NOT NULL,
    sequence integer NOT NULL,
    status "RouteStopStatus" DEFAULT 'PENDING'::"RouteStopStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: routes; Type: TABLE

CREATE TABLE routes (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "transporterId" text NOT NULL,
    name text NOT NULL,
    "plannedDate" timestamp(3) without time zone,
    status "RouteStatus" DEFAULT 'PLANNED'::"RouteStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: support_ticket_messages; Type: TABLE

CREATE TABLE support_ticket_messages (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "ticketId" text NOT NULL,
    "authorId" text NOT NULL,
    body text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: support_tickets; Type: TABLE

CREATE TABLE support_tickets (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "requesterId" text NOT NULL,
    "agentId" text,
    subject text NOT NULL,
    description text NOT NULL,
    status "SupportTicketStatus" DEFAULT 'OPEN'::"SupportTicketStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: transport_orders; Type: TABLE

CREATE TABLE transport_orders (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "orderId" text NOT NULL,
    "transporterId" text,
    status "TransportStatus" DEFAULT 'REQUESTED'::"TransportStatus" NOT NULL,
    "proposedPrice" numeric(14,2),
    "agreedPrice" numeric(14,2),
    "pickupOtp" text,
    "pickupAt" timestamp(3) without time zone,
    "deliveryOtp" text,
    "deliveredAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Name: transport_proposals; Type: TABLE

CREATE TABLE transport_proposals (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "transportOrderId" text NOT NULL,
    "transporterId" text NOT NULL,
    price numeric(14,2) NOT NULL,
    message text,
    accepted boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: transport_status_events; Type: TABLE

CREATE TABLE transport_status_events (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "transportOrderId" text NOT NULL,
    status "TransportStatus" NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Name: transporters; Type: TABLE

CREATE TABLE transporters (
    id text NOT NULL DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    "vehicleType" text,
    "vehiclePlate" text,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "averageRating" numeric(3,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transporterCategory" "TransporterCategory",
    "cargoCapacity" text,
    "cargoType" text,
    "serviceAreas" text[] DEFAULT ARRAY[]::text[] NOT NULL,
    "servicePrice" text
);

-- Name: users; Type: TABLE

CREATE TABLE users (
    id text NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    phone text,
    email text,
    "passwordHash" text NOT NULL,
    role "UserRole" NOT NULL,
    province text NOT NULL,
    municipality text NOT NULL,
    "activityType" "ActivityType",
    "trustLevel" "TrustLevel" DEFAULT 'LEVEL_1_CONTACT_VALIDATED'::"TrustLevel" NOT NULL,
    "isVerifiedBadge" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "mfaEnabled" boolean DEFAULT false NOT NULL,
    "mfaSecret" text,
    "phoneVerifiedAt" timestamp(3) without time zone,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nif text,
    locality text,
    "avatarUrl" text,
    "notifyByEmail" boolean DEFAULT true NOT NULL,
    "notifyByPush" boolean DEFAULT false NOT NULL,
    "passwordResetExpiresAt" timestamp(3) without time zone,
    "passwordResetTokenHash" text,
    "verificationNote" text,
    "verificationRequestedAt" timestamp(3) without time zone,
    "verificationReviewedAt" timestamp(3) without time zone,
    "verificationStatus" "ProfileVerificationStatus" DEFAULT 'NONE'::"ProfileVerificationStatus" NOT NULL
);

-- Name: addresses addresses_pkey; Type: CONSTRAINT

ALTER TABLE ONLY addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);

-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT

ALTER TABLE ONLY audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);

-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT

ALTER TABLE ONLY bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);

-- Name: banners banners_pkey; Type: CONSTRAINT

ALTER TABLE ONLY banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);

-- Name: categories categories_pkey; Type: CONSTRAINT

ALTER TABLE ONLY categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);

-- Name: complaint_messages complaint_messages_pkey; Type: CONSTRAINT

ALTER TABLE ONLY complaint_messages
    ADD CONSTRAINT complaint_messages_pkey PRIMARY KEY (id);

-- Name: complaints complaints_pkey; Type: CONSTRAINT

ALTER TABLE ONLY complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);

-- Name: conversation_messages conversation_messages_pkey; Type: CONSTRAINT

ALTER TABLE ONLY conversation_messages
    ADD CONSTRAINT conversation_messages_pkey PRIMARY KEY (id);

-- Name: conversations conversations_pkey; Type: CONSTRAINT

ALTER TABLE ONLY conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);

-- Name: documents documents_pkey; Type: CONSTRAINT

ALTER TABLE ONLY documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);

-- Name: favorites favorites_pkey; Type: CONSTRAINT

ALTER TABLE ONLY favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);

-- Name: formalization_diagnoses formalization_diagnoses_pkey; Type: CONSTRAINT

ALTER TABLE ONLY formalization_diagnoses
    ADD CONSTRAINT formalization_diagnoses_pkey PRIMARY KEY (id);

-- Name: formalization_dossiers formalization_dossiers_pkey; Type: CONSTRAINT

ALTER TABLE ONLY formalization_dossiers
    ADD CONSTRAINT formalization_dossiers_pkey PRIMARY KEY (id);

-- Name: formalization_stages formalization_stages_pkey; Type: CONSTRAINT

ALTER TABLE ONLY formalization_stages
    ADD CONSTRAINT formalization_stages_pkey PRIMARY KEY (id);

-- Name: inss_consents inss_consents_pkey; Type: CONSTRAINT

ALTER TABLE ONLY inss_consents
    ADD CONSTRAINT inss_consents_pkey PRIMARY KEY (id);

-- Name: inss_documents inss_documents_pkey; Type: CONSTRAINT

ALTER TABLE ONLY inss_documents
    ADD CONSTRAINT inss_documents_pkey PRIMARY KEY (id);

-- Name: inss_linkages inss_linkages_pkey; Type: CONSTRAINT

ALTER TABLE ONLY inss_linkages
    ADD CONSTRAINT inss_linkages_pkey PRIMARY KEY (id);

-- Name: inss_simulations inss_simulations_pkey; Type: CONSTRAINT

ALTER TABLE ONLY inss_simulations
    ADD CONSTRAINT inss_simulations_pkey PRIMARY KEY (id);

-- Name: inss_sync_events inss_sync_events_pkey; Type: CONSTRAINT

ALTER TABLE ONLY inss_sync_events
    ADD CONSTRAINT inss_sync_events_pkey PRIMARY KEY (id);

-- Name: merchant_profiles merchant_profiles_pkey; Type: CONSTRAINT

ALTER TABLE ONLY merchant_profiles
    ADD CONSTRAINT merchant_profiles_pkey PRIMARY KEY (id);

-- Name: notifications notifications_pkey; Type: CONSTRAINT

ALTER TABLE ONLY notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

-- Name: order_items order_items_pkey; Type: CONSTRAINT

ALTER TABLE ONLY order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);

-- Name: order_status_events order_status_events_pkey; Type: CONSTRAINT

ALTER TABLE ONLY order_status_events
    ADD CONSTRAINT order_status_events_pkey PRIMARY KEY (id);

-- Name: orders orders_pkey; Type: CONSTRAINT

ALTER TABLE ONLY orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);

-- Name: payment_status_events payment_status_events_pkey; Type: CONSTRAINT

ALTER TABLE ONLY payment_status_events
    ADD CONSTRAINT payment_status_events_pkey PRIMARY KEY (id);

-- Name: payments payments_pkey; Type: CONSTRAINT

ALTER TABLE ONLY payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);

-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT

ALTER TABLE ONLY platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (key);

-- Name: producer_profiles producer_profiles_pkey; Type: CONSTRAINT

ALTER TABLE ONLY producer_profiles
    ADD CONSTRAINT producer_profiles_pkey PRIMARY KEY (id);

-- Name: product_photos product_photos_pkey; Type: CONSTRAINT

ALTER TABLE ONLY product_photos
    ADD CONSTRAINT product_photos_pkey PRIMARY KEY (id);

-- Name: products products_pkey; Type: CONSTRAINT

ALTER TABLE ONLY products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);

-- Name: quote_proposals quote_proposals_pkey; Type: CONSTRAINT

ALTER TABLE ONLY quote_proposals
    ADD CONSTRAINT quote_proposals_pkey PRIMARY KEY (id);

-- Name: quote_requests quote_requests_pkey; Type: CONSTRAINT

ALTER TABLE ONLY quote_requests
    ADD CONSTRAINT quote_requests_pkey PRIMARY KEY (id);

-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT

ALTER TABLE ONLY refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);

-- Name: reviews reviews_pkey; Type: CONSTRAINT

ALTER TABLE ONLY reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);

-- Name: route_stops route_stops_pkey; Type: CONSTRAINT

ALTER TABLE ONLY route_stops
    ADD CONSTRAINT route_stops_pkey PRIMARY KEY (id);

-- Name: routes routes_pkey; Type: CONSTRAINT

ALTER TABLE ONLY routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);

-- Name: support_ticket_messages support_ticket_messages_pkey; Type: CONSTRAINT

ALTER TABLE ONLY support_ticket_messages
    ADD CONSTRAINT support_ticket_messages_pkey PRIMARY KEY (id);

-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT

ALTER TABLE ONLY support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);

-- Name: transport_orders transport_orders_pkey; Type: CONSTRAINT

ALTER TABLE ONLY transport_orders
    ADD CONSTRAINT transport_orders_pkey PRIMARY KEY (id);

-- Name: transport_proposals transport_proposals_pkey; Type: CONSTRAINT

ALTER TABLE ONLY transport_proposals
    ADD CONSTRAINT transport_proposals_pkey PRIMARY KEY (id);

-- Name: transport_status_events transport_status_events_pkey; Type: CONSTRAINT

ALTER TABLE ONLY transport_status_events
    ADD CONSTRAINT transport_status_events_pkey PRIMARY KEY (id);

-- Name: transporters transporters_pkey; Type: CONSTRAINT

ALTER TABLE ONLY transporters
    ADD CONSTRAINT transporters_pkey PRIMARY KEY (id);

-- Name: users users_pkey; Type: CONSTRAINT

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Name: addresses_userId_idx; Type: INDEX

CREATE INDEX "addresses_userId_idx" ON addresses USING btree ("userId");

-- Name: audit_logs_createdAt_idx; Type: INDEX

CREATE INDEX "audit_logs_createdAt_idx" ON audit_logs USING btree ("createdAt");

-- Name: audit_logs_entity_entityId_idx; Type: INDEX

CREATE INDEX "audit_logs_entity_entityId_idx" ON audit_logs USING btree (entity, "entityId");

-- Name: audit_logs_userId_idx; Type: INDEX

CREATE INDEX "audit_logs_userId_idx" ON audit_logs USING btree ("userId");

-- Name: bank_accounts_userId_idx; Type: INDEX

CREATE INDEX "bank_accounts_userId_idx" ON bank_accounts USING btree ("userId");

-- Name: banners_isActive_position_idx; Type: INDEX

CREATE INDEX "banners_isActive_position_idx" ON banners USING btree ("isActive", "position");

-- Name: categories_slug_key; Type: INDEX

CREATE UNIQUE INDEX categories_slug_key ON categories USING btree (slug);

-- Name: complaint_messages_complaintId_idx; Type: INDEX

CREATE INDEX "complaint_messages_complaintId_idx" ON complaint_messages USING btree ("complaintId");

-- Name: complaints_complainantId_idx; Type: INDEX

CREATE INDEX "complaints_complainantId_idx" ON complaints USING btree ("complainantId");

-- Name: complaints_status_idx; Type: INDEX

CREATE INDEX complaints_status_idx ON complaints USING btree (status);

-- Name: conversation_messages_conversationId_idx; Type: INDEX

CREATE INDEX "conversation_messages_conversationId_idx" ON conversation_messages USING btree ("conversationId");

-- Name: conversations_participantOneId_idx; Type: INDEX

CREATE INDEX "conversations_participantOneId_idx" ON conversations USING btree ("participantOneId");

-- Name: conversations_participantOneId_participantTwoId_contextOrde_key; Type: INDEX

CREATE UNIQUE INDEX "conversations_participantOneId_participantTwoId_contextOrde_key" ON conversations USING btree ("participantOneId", "participantTwoId", "contextOrderId", "contextProductId");

-- Name: conversations_participantTwoId_idx; Type: INDEX

CREATE INDEX "conversations_participantTwoId_idx" ON conversations USING btree ("participantTwoId");

-- Name: documents_ownerId_idx; Type: INDEX

CREATE INDEX "documents_ownerId_idx" ON documents USING btree ("ownerId");

-- Name: documents_status_idx; Type: INDEX

CREATE INDEX documents_status_idx ON documents USING btree (status);

-- Name: favorites_userId_idx; Type: INDEX

CREATE INDEX "favorites_userId_idx" ON favorites USING btree ("userId");

-- Name: favorites_userId_productId_key; Type: INDEX

CREATE UNIQUE INDEX "favorites_userId_productId_key" ON favorites USING btree ("userId", "productId");

-- Name: formalization_diagnoses_dossierId_key; Type: INDEX

CREATE UNIQUE INDEX "formalization_diagnoses_dossierId_key" ON formalization_diagnoses USING btree ("dossierId");

-- Name: formalization_dossiers_userId_key; Type: INDEX

CREATE UNIQUE INDEX "formalization_dossiers_userId_key" ON formalization_dossiers USING btree ("userId");

-- Name: formalization_stages_dossierId_stageNumber_key; Type: INDEX

CREATE UNIQUE INDEX "formalization_stages_dossierId_stageNumber_key" ON formalization_stages USING btree ("dossierId", "stageNumber");

-- Name: inss_consents_linkageId_idx; Type: INDEX

CREATE INDEX "inss_consents_linkageId_idx" ON inss_consents USING btree ("linkageId");

-- Name: inss_documents_linkageId_idx; Type: INDEX

CREATE INDEX "inss_documents_linkageId_idx" ON inss_documents USING btree ("linkageId");

-- Name: inss_linkages_userId_key; Type: INDEX

CREATE UNIQUE INDEX "inss_linkages_userId_key" ON inss_linkages USING btree ("userId");

-- Name: inss_simulations_linkageId_idx; Type: INDEX

CREATE INDEX "inss_simulations_linkageId_idx" ON inss_simulations USING btree ("linkageId");

-- Name: inss_sync_events_linkageId_idx; Type: INDEX

CREATE INDEX "inss_sync_events_linkageId_idx" ON inss_sync_events USING btree ("linkageId");

-- Name: merchant_profiles_userId_key; Type: INDEX

CREATE UNIQUE INDEX "merchant_profiles_userId_key" ON merchant_profiles USING btree ("userId");

-- Name: notifications_userId_read_idx; Type: INDEX

CREATE INDEX "notifications_userId_read_idx" ON notifications USING btree ("userId", read);

-- Name: order_items_orderId_idx; Type: INDEX

CREATE INDEX "order_items_orderId_idx" ON order_items USING btree ("orderId");

-- Name: order_items_productId_idx; Type: INDEX

CREATE INDEX "order_items_productId_idx" ON order_items USING btree ("productId");

-- Name: order_status_events_orderId_idx; Type: INDEX

CREATE INDEX "order_status_events_orderId_idx" ON order_status_events USING btree ("orderId");

-- Name: orders_buyerId_idx; Type: INDEX

CREATE INDEX "orders_buyerId_idx" ON orders USING btree ("buyerId");

-- Name: orders_status_idx; Type: INDEX

CREATE INDEX orders_status_idx ON orders USING btree (status);

-- Name: payment_status_events_paymentId_idx; Type: INDEX

CREATE INDEX "payment_status_events_paymentId_idx" ON payment_status_events USING btree ("paymentId");

-- Name: payments_orderId_key; Type: INDEX

CREATE UNIQUE INDEX "payments_orderId_key" ON payments USING btree ("orderId");

-- Name: payments_status_idx; Type: INDEX

CREATE INDEX payments_status_idx ON payments USING btree (status);

-- Name: producer_profiles_userId_key; Type: INDEX

CREATE UNIQUE INDEX "producer_profiles_userId_key" ON producer_profiles USING btree ("userId");

-- Name: product_photos_productId_idx; Type: INDEX

CREATE INDEX "product_photos_productId_idx" ON product_photos USING btree ("productId");

-- Name: products_categoryId_idx; Type: INDEX

CREATE INDEX "products_categoryId_idx" ON products USING btree ("categoryId");

-- Name: products_listingType_idx; Type: INDEX

CREATE INDEX "products_listingType_idx" ON products USING btree ("listingType");

-- Name: products_ownerId_idx; Type: INDEX

CREATE INDEX "products_ownerId_idx" ON products USING btree ("ownerId");

-- Name: products_status_idx; Type: INDEX

CREATE INDEX products_status_idx ON products USING btree (status);

-- Name: quote_proposals_quoteRequestId_idx; Type: INDEX

CREATE INDEX "quote_proposals_quoteRequestId_idx" ON quote_proposals USING btree ("quoteRequestId");

-- Name: quote_requests_requesterId_idx; Type: INDEX

CREATE INDEX "quote_requests_requesterId_idx" ON quote_requests USING btree ("requesterId");

-- Name: quote_requests_status_idx; Type: INDEX

CREATE INDEX quote_requests_status_idx ON quote_requests USING btree (status);

-- Name: refresh_tokens_tokenHash_key; Type: INDEX

CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON refresh_tokens USING btree ("tokenHash");

-- Name: refresh_tokens_userId_idx; Type: INDEX

CREATE INDEX "refresh_tokens_userId_idx" ON refresh_tokens USING btree ("userId");

-- Name: reviews_productId_idx; Type: INDEX

CREATE INDEX "reviews_productId_idx" ON reviews USING btree ("productId");

-- Name: reviews_targetUserId_idx; Type: INDEX

CREATE INDEX "reviews_targetUserId_idx" ON reviews USING btree ("targetUserId");

-- Name: route_stops_routeId_idx; Type: INDEX

CREATE INDEX "route_stops_routeId_idx" ON route_stops USING btree ("routeId");

-- Name: route_stops_routeId_transportOrderId_key; Type: INDEX

CREATE UNIQUE INDEX "route_stops_routeId_transportOrderId_key" ON route_stops USING btree ("routeId", "transportOrderId");

-- Name: routes_transporterId_idx; Type: INDEX

CREATE INDEX "routes_transporterId_idx" ON routes USING btree ("transporterId");

-- Name: support_ticket_messages_ticketId_idx; Type: INDEX

CREATE INDEX "support_ticket_messages_ticketId_idx" ON support_ticket_messages USING btree ("ticketId");

-- Name: support_tickets_status_idx; Type: INDEX

CREATE INDEX support_tickets_status_idx ON support_tickets USING btree (status);

-- Name: transport_orders_orderId_key; Type: INDEX

CREATE UNIQUE INDEX "transport_orders_orderId_key" ON transport_orders USING btree ("orderId");

-- Name: transport_orders_status_idx; Type: INDEX

CREATE INDEX transport_orders_status_idx ON transport_orders USING btree (status);

-- Name: transport_orders_transporterId_idx; Type: INDEX

CREATE INDEX "transport_orders_transporterId_idx" ON transport_orders USING btree ("transporterId");

-- Name: transport_proposals_transportOrderId_idx; Type: INDEX

CREATE INDEX "transport_proposals_transportOrderId_idx" ON transport_proposals USING btree ("transportOrderId");

-- Name: transport_proposals_transporterId_idx; Type: INDEX

CREATE INDEX "transport_proposals_transporterId_idx" ON transport_proposals USING btree ("transporterId");

-- Name: transport_status_events_transportOrderId_idx; Type: INDEX

CREATE INDEX "transport_status_events_transportOrderId_idx" ON transport_status_events USING btree ("transportOrderId");

-- Name: transporters_userId_key; Type: INDEX

CREATE UNIQUE INDEX "transporters_userId_key" ON transporters USING btree ("userId");

-- Name: users_email_key; Type: INDEX

CREATE UNIQUE INDEX users_email_key ON users USING btree (email);

-- Name: users_nif_key; Type: INDEX

CREATE UNIQUE INDEX users_nif_key ON users USING btree (nif);

-- Name: users_phone_key; Type: INDEX

CREATE UNIQUE INDEX users_phone_key ON users USING btree (phone);

-- Name: users_province_municipality_idx; Type: INDEX

CREATE INDEX users_province_municipality_idx ON users USING btree (province, municipality);

-- Name: users_role_idx; Type: INDEX

CREATE INDEX users_role_idx ON users USING btree (role);

-- Name: addresses addresses_userId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY addresses
    ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Name: bank_accounts bank_accounts_userId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY bank_accounts
    ADD CONSTRAINT "bank_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: banners banners_createdById_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY banners
    ADD CONSTRAINT "banners_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Name: categories categories_parentId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY categories
    ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES categories(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Name: complaint_messages complaint_messages_authorId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY complaint_messages
    ADD CONSTRAINT "complaint_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: complaint_messages complaint_messages_complaintId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY complaint_messages
    ADD CONSTRAINT "complaint_messages_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES complaints(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: complaints complaints_agentId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY complaints
    ADD CONSTRAINT "complaints_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Name: complaints complaints_complainantId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY complaints
    ADD CONSTRAINT "complaints_complainantId_fkey" FOREIGN KEY ("complainantId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: conversation_messages conversation_messages_authorId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY conversation_messages
    ADD CONSTRAINT "conversation_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: conversation_messages conversation_messages_conversationId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY conversation_messages
    ADD CONSTRAINT "conversation_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: conversations conversations_participantOneId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY conversations
    ADD CONSTRAINT "conversations_participantOneId_fkey" FOREIGN KEY ("participantOneId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: conversations conversations_participantTwoId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY conversations
    ADD CONSTRAINT "conversations_participantTwoId_fkey" FOREIGN KEY ("participantTwoId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: documents documents_dossierId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY documents
    ADD CONSTRAINT "documents_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES formalization_dossiers(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Name: documents documents_ownerId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY documents
    ADD CONSTRAINT "documents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: favorites favorites_productId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY favorites
    ADD CONSTRAINT "favorites_productId_fkey" FOREIGN KEY ("productId") REFERENCES products(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: favorites favorites_userId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY favorites
    ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: formalization_diagnoses formalization_diagnoses_dossierId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY formalization_diagnoses
    ADD CONSTRAINT "formalization_diagnoses_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES formalization_dossiers(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: formalization_dossiers formalization_dossiers_userId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY formalization_dossiers
    ADD CONSTRAINT "formalization_dossiers_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: formalization_stages formalization_stages_dossierId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY formalization_stages
    ADD CONSTRAINT "formalization_stages_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES formalization_dossiers(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: inss_consents inss_consents_linkageId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY inss_consents
    ADD CONSTRAINT "inss_consents_linkageId_fkey" FOREIGN KEY ("linkageId") REFERENCES inss_linkages(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: inss_documents inss_documents_linkageId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY inss_documents
    ADD CONSTRAINT "inss_documents_linkageId_fkey" FOREIGN KEY ("linkageId") REFERENCES inss_linkages(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: inss_linkages inss_linkages_userId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY inss_linkages
    ADD CONSTRAINT "inss_linkages_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: inss_simulations inss_simulations_linkageId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY inss_simulations
    ADD CONSTRAINT "inss_simulations_linkageId_fkey" FOREIGN KEY ("linkageId") REFERENCES inss_linkages(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: inss_sync_events inss_sync_events_linkageId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY inss_sync_events
    ADD CONSTRAINT "inss_sync_events_linkageId_fkey" FOREIGN KEY ("linkageId") REFERENCES inss_linkages(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: merchant_profiles merchant_profiles_userId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY merchant_profiles
    ADD CONSTRAINT "merchant_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES orders(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES products(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: order_status_events order_status_events_orderId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY order_status_events
    ADD CONSTRAINT "order_status_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES orders(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: orders orders_buyerId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY orders
    ADD CONSTRAINT "orders_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: orders orders_shippingAddressId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY orders
    ADD CONSTRAINT "orders_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES addresses(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: payment_status_events payment_status_events_paymentId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY payment_status_events
    ADD CONSTRAINT "payment_status_events_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES payments(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: payments payments_orderId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY payments
    ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: platform_settings platform_settings_updatedById_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY platform_settings
    ADD CONSTRAINT "platform_settings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Name: producer_profiles producer_profiles_userId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY producer_profiles
    ADD CONSTRAINT "producer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: product_photos product_photos_productId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY product_photos
    ADD CONSTRAINT "product_photos_productId_fkey" FOREIGN KEY ("productId") REFERENCES products(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: products products_ownerId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY products
    ADD CONSTRAINT "products_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: quote_proposals quote_proposals_proposerId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY quote_proposals
    ADD CONSTRAINT "quote_proposals_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: quote_proposals quote_proposals_quoteRequestId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY quote_proposals
    ADD CONSTRAINT "quote_proposals_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES quote_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: quote_requests quote_requests_productId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY quote_requests
    ADD CONSTRAINT "quote_requests_productId_fkey" FOREIGN KEY ("productId") REFERENCES products(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Name: quote_requests quote_requests_requesterId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY quote_requests
    ADD CONSTRAINT "quote_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: refresh_tokens refresh_tokens_userId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: reviews reviews_authorId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY reviews
    ADD CONSTRAINT "reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: reviews reviews_orderId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY reviews
    ADD CONSTRAINT "reviews_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES products(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Name: route_stops route_stops_routeId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY route_stops
    ADD CONSTRAINT "route_stops_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES routes(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: route_stops route_stops_transportOrderId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY route_stops
    ADD CONSTRAINT "route_stops_transportOrderId_fkey" FOREIGN KEY ("transportOrderId") REFERENCES transport_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: routes routes_transporterId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY routes
    ADD CONSTRAINT "routes_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES transporters(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: support_ticket_messages support_ticket_messages_authorId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY support_ticket_messages
    ADD CONSTRAINT "support_ticket_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: support_ticket_messages support_ticket_messages_ticketId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY support_ticket_messages
    ADD CONSTRAINT "support_ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES support_tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: support_tickets support_tickets_agentId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY support_tickets
    ADD CONSTRAINT "support_tickets_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Name: support_tickets support_tickets_requesterId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY support_tickets
    ADD CONSTRAINT "support_tickets_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: transport_orders transport_orders_orderId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY transport_orders
    ADD CONSTRAINT "transport_orders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: transport_orders transport_orders_transporterId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY transport_orders
    ADD CONSTRAINT "transport_orders_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES transporters(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Name: transport_proposals transport_proposals_transportOrderId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY transport_proposals
    ADD CONSTRAINT "transport_proposals_transportOrderId_fkey" FOREIGN KEY ("transportOrderId") REFERENCES transport_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: transport_proposals transport_proposals_transporterId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY transport_proposals
    ADD CONSTRAINT "transport_proposals_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES transporters(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Name: transport_status_events transport_status_events_transportOrderId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY transport_status_events
    ADD CONSTRAINT "transport_status_events_transportOrderId_fkey" FOREIGN KEY ("transportOrderId") REFERENCES transport_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Name: transporters transporters_userId_fkey; Type: FK CONSTRAINT

ALTER TABLE ONLY transporters
    ADD CONSTRAINT "transporters_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

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

CREATE TRIGGER set_transporters_updated_at
BEFORE UPDATE ON "transporters"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_producer_profiles_updated_at
BEFORE UPDATE ON "producer_profiles"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_merchant_profiles_updated_at
BEFORE UPDATE ON "merchant_profiles"
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

CREATE TRIGGER set_complaints_updated_at
BEFORE UPDATE ON "complaints"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_routes_updated_at
BEFORE UPDATE ON "routes"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_platform_settings_updated_at
BEFORE UPDATE ON "platform_settings"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_banners_updated_at
BEFORE UPDATE ON "banners"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_conversations_updated_at
BEFORE UPDATE ON "conversations"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
