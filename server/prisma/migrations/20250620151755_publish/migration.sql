/*
  Warnings:

  - You are about to drop the column `sentAt` on the `NewsletterPublication` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NewsletterPublication" DROP COLUMN "sentAt",
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ALTER COLUMN "content" DROP DEFAULT;
