-- AlterTable: make category_id nullable so TRANSFER transactions can omit it
ALTER TABLE "transactions" ALTER COLUMN "category_id" DROP NOT NULL;
