-- CreateTable
CREATE TABLE "OpeningTime" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "open" BOOLEAN NOT NULL,
    "start" TEXT,
    "end" TEXT,

    CONSTRAINT "OpeningTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayClosed" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DayClosed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DayClosed_date_key" ON "DayClosed"("date");
