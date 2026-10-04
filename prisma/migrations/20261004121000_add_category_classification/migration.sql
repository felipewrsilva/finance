-- AlterTable
ALTER TABLE "categories" ADD COLUMN "isEssential" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "groupType" "BudgetGroupType";
