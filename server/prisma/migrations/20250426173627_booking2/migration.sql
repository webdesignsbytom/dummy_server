/*
  Warnings:

  - A unique constraint covering the columns `[dayOfWeek]` on the table `OpeningTime` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OpeningTime_dayOfWeek_key" ON "OpeningTime"("dayOfWeek");
