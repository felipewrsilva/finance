/*
  Warnings:

  - You are about to drop the column `currency` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BRL';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "amountInDefaultCurrency" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BRL',
ADD COLUMN     "exchangeRateUsed" DECIMAL(14,6) NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "currency",
ADD COLUMN     "defaultCurrency" TEXT NOT NULL DEFAULT 'BRL',
ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'pt-BR';

-- CreateTable
CREATE TABLE "user_currencies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_currencies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_currencies_userId_currency_key" ON "user_currencies"("userId", "currency");

-- AddForeignKey
ALTER TABLE "user_currencies" ADD CONSTRAINT "user_currencies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
