-- Rebrand: XKWANZA -> AO Market. O valor do enum é renomeado (não recriado), preservando
-- as linhas existentes em "products" que já usem DeliveryOption.XKWANZA_TRANSPORT.
ALTER TYPE "DeliveryOption" RENAME VALUE 'XKWANZA_TRANSPORT' TO 'AO_MARKET_TRANSPORT';
