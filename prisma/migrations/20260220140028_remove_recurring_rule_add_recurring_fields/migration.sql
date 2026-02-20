/*
  Warnings:

  - You are about to drop the column `recurringRuleId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `recurring_rules` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "recurring_rules" DROP CONSTRAINT "recurring_rules_userId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_recurringRuleId_fkey";

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "bankKey" TEXT,
ADD COLUMN     "bankName" TEXT;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "recurringRuleId",
ADD COLUMN     "frequency" "Frequency",
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentTransactionId" TEXT,
ADD COLUMN     "recurrenceEnd" TIMESTAMP(3);

-- DropTable
DROP TABLE "recurring_rules";

-- CreateIndex
CREATE INDEX "transactions_userId_isRecurring_idx" ON "transactions"("userId", "isRecurring");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_parentTransactionId_fkey" FOREIGN KEY ("parentTransactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
