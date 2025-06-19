-- DropIndex
DROP INDEX "NewsletterVerificationToken_uniqueString_key";

-- AlterTable
ALTER TABLE "NewsletterSubscriber" ADD COLUMN     "uniqueStringUnsubscribe" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "NewsletterVerificationToken" ALTER COLUMN "uniqueString" SET DEFAULT '';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
