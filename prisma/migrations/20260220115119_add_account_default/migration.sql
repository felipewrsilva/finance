-- AlterEnum
ALTER TYPE "AccountType" ADD VALUE 'CHECKING';

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;
