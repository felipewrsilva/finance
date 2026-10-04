-- CreateEnum
CREATE TYPE "BudgetGroupType" AS ENUM ('FIXED_COSTS', 'COMFORT', 'GOALS', 'INVESTMENTS');

-- CreateTable
CREATE TABLE "budget_groups" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "BudgetGroupType" NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_groups_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "budgets" ADD COLUMN "groupId" TEXT,
ADD COLUMN "percentageOfGroup" DECIMAL(5,2);

-- CreateIndex
CREATE INDEX "budget_groups_userId_sortOrder_idx" ON "budget_groups"("userId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "budget_groups_userId_type_key" ON "budget_groups"("userId", "type");

-- CreateIndex
CREATE INDEX "budgets_userId_groupId_idx" ON "budgets"("userId", "groupId");

-- AddForeignKey
ALTER TABLE "budget_groups" ADD CONSTRAINT "budget_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "budget_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
