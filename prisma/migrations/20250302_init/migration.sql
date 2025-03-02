-- CreateTable
CREATE TABLE "HeadacheEntry" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "severity" INTEGER NOT NULL,
  "notes" TEXT,
  "medications" TEXT NOT NULL,
  "triggers" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HeadacheEntry_pkey" PRIMARY KEY ("id")
);
