-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HeadacheEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "severity" INTEGER NOT NULL,
    "notes" TEXT,
    "medications" TEXT NOT NULL,
    "triggers" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_HeadacheEntry" ("createdAt", "date", "id", "medications", "notes", "severity", "triggers", "updatedAt") SELECT "createdAt", "date", "id", "medications", "notes", "severity", "triggers", "updatedAt" FROM "HeadacheEntry";
DROP TABLE "HeadacheEntry";
ALTER TABLE "new_HeadacheEntry" RENAME TO "HeadacheEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
