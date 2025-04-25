/*
  Warnings:

  - You are about to drop the `EmailVerification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EmailVerification" DROP CONSTRAINT "EmailVerification_userId_fkey";

-- DropTable
DROP TABLE "EmailVerification";

-- CreateTable
CREATE TABLE "UserVerificationEmail" (
    "id" TEXT NOT NULL,
    "uniqueString" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "UserVerificationEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserVerificationEmail_uniqueString_key" ON "UserVerificationEmail"("uniqueString");

-- CreateIndex
CREATE UNIQUE INDEX "UserVerificationEmail_userId_key" ON "UserVerificationEmail"("userId");

-- AddForeignKey
ALTER TABLE "UserVerificationEmail" ADD CONSTRAINT "UserVerificationEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
