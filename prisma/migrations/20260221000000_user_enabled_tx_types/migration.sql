-- AlterTable
ALTER TABLE "users" ADD COLUMN "enabledTransactionTypes" "TransactionType"[] NOT NULL DEFAULT ARRAY['INCOME', 'EXPENSE', 'TRANSFER', 'INVESTMENT']::"TransactionType"[];
