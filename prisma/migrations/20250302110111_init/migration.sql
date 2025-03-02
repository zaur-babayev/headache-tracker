-- CreateTable
CREATE TABLE "HeadacheEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "severity" INTEGER NOT NULL,
    "notes" TEXT,
    "triggers" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "headacheEntryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Medication_headacheEntryId_fkey" FOREIGN KEY ("headacheEntryId") REFERENCES "HeadacheEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
