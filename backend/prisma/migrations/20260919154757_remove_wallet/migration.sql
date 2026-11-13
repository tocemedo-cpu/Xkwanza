-- Remoção completa da funcionalidade de carteira/saldo (persona restructuring).
-- Os pagamentos continuam normalmente (Payment/PaymentStatusEvent/BankAccount intactos) —
-- apenas o saldo acumulado em carteira interna deixa de existir.
DROP TABLE "wallets";
