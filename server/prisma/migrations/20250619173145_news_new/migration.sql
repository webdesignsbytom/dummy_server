-- AlterTable
ALTER TABLE "NewsletterSubscriber" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "NewsletterVerificationToken" (
    "id" TEXT NOT NULL,
    "uniqueString" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "NewsletterVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterVerificationToken_uniqueString_key" ON "NewsletterVerificationToken"("uniqueString");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterVerificationToken_subscriberId_key" ON "NewsletterVerificationToken"("subscriberId");

-- AddForeignKey
ALTER TABLE "NewsletterVerificationToken" ADD CONSTRAINT "NewsletterVerificationToken_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "NewsletterSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
