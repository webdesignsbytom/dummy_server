/*
  Warnings:

  - You are about to drop the column `verified` on the `NewsletterSubscriber` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NewsletterSubscriber" DROP COLUMN "verified",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
