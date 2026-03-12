-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidAt" TIMESTAMP(6);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "paymentMethod" TEXT;
