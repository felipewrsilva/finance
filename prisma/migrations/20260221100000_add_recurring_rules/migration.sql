-- CreateTable
CREATE TABLE "recurring_rules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT,
    "destinationAccountId" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "description" TEXT,
    "frequency" "Frequency" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "lastGeneratedDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurring_rules_userId_isActive_idx" ON "recurring_rules"("userId", "isActive");

-- AddForeignKey (recurring_rules → users)
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (recurring_rules → accounts)
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON UPDATE CASCADE;

-- AddForeignKey (recurring_rules → categories)
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable (transactions → add recurringRuleId)
ALTER TABLE "transactions" ADD COLUMN "recurringRuleId" TEXT;

-- AddForeignKey (transactions → recurring_rules)
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurringRuleId_fkey"
    FOREIGN KEY ("recurringRuleId") REFERENCES "recurring_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate existing isRecurring=true transactions → create a RecurringRule per transaction
DO $$
DECLARE
    tx RECORD;
    rule_id TEXT;
BEGIN
    FOR tx IN
        SELECT * FROM transactions
        WHERE "isRecurring" = true
          AND "frequency" IS NOT NULL
          AND "recurringRuleId" IS NULL
    LOOP
        rule_id := gen_random_uuid()::text;
        INSERT INTO recurring_rules (
            id, "userId", "accountId", "categoryId", type, amount, currency,
            description, frequency, "startDate", "lastGeneratedDate", "isActive",
            "createdAt", "updatedAt"
        ) VALUES (
            rule_id,
            tx."userId",
            tx."accountId",
            tx."categoryId",
            tx.type,
            tx.amount,
            tx.currency,
            tx.description,
            tx.frequency,
            tx.date,
            tx.date,
            true,
            NOW(),
            NOW()
        );
        UPDATE transactions SET "recurringRuleId" = rule_id WHERE id = tx.id;
    END LOOP;
END $$;
