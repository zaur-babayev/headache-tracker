/*
  Warnings:

  - You are about to drop the `Medication` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `medications` to the `HeadacheEntry` table without a default value. This is not possible if the table is not empty.
  - Made the column `triggers` on table `HeadacheEntry` required. This step will fail if there are existing NULL values in that column.

*/

-- First, get the medications for each headache entry
CREATE TABLE "_temp_medications" AS
SELECT 
  he.id as headache_id,
  json_group_array(m.name) as medications
FROM "HeadacheEntry" he
LEFT JOIN "Medication" m ON m.headacheEntryId = he.id
GROUP BY he.id;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Medication";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HeadacheEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "severity" INTEGER NOT NULL,
    "notes" TEXT,
    "medications" TEXT NOT NULL DEFAULT '[]',
    "triggers" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Copy data with medications from temp table
INSERT INTO "new_HeadacheEntry" (
    "id", 
    "date", 
    "severity", 
    "notes", 
    "medications",
    "triggers",
    "createdAt", 
    "updatedAt"
) 
SELECT 
    he."id",
    he."date",
    he."severity",
    he."notes",
    COALESCE(tm.medications, '[]'),
    COALESCE(he."triggers", '[]'),
    he."createdAt",
    he."updatedAt"
FROM "HeadacheEntry" he
LEFT JOIN "_temp_medications" tm ON tm.headache_id = he.id;

-- Clean up
DROP TABLE "HeadacheEntry";
DROP TABLE "_temp_medications";
ALTER TABLE "new_HeadacheEntry" RENAME TO "HeadacheEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
