-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyOeeResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "lineDesc" TEXT NOT NULL,
    "shift" INTEGER NOT NULL,
    "availability" REAL,
    "performance" REAL NOT NULL,
    "quality" REAL,
    "oee" REAL NOT NULL
);
INSERT INTO "new_DailyOeeResult" ("availability", "date", "id", "lineDesc", "oee", "performance", "quality", "shift") SELECT "availability", "date", "id", "lineDesc", "oee", "performance", "quality", "shift" FROM "DailyOeeResult";
DROP TABLE "DailyOeeResult";
ALTER TABLE "new_DailyOeeResult" RENAME TO "DailyOeeResult";
CREATE UNIQUE INDEX "DailyOeeResult_date_lineDesc_shift_key" ON "DailyOeeResult"("date", "lineDesc", "shift");
CREATE TABLE "new_StagingOeeResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "lineDesc" TEXT NOT NULL,
    "shift" INTEGER NOT NULL,
    "availability" REAL,
    "performance" REAL NOT NULL,
    "quality" REAL,
    "oee" REAL NOT NULL
);
INSERT INTO "new_StagingOeeResult" ("availability", "date", "id", "lineDesc", "oee", "performance", "quality", "shift") SELECT "availability", "date", "id", "lineDesc", "oee", "performance", "quality", "shift" FROM "StagingOeeResult";
DROP TABLE "StagingOeeResult";
ALTER TABLE "new_StagingOeeResult" RENAME TO "StagingOeeResult";
CREATE UNIQUE INDEX "StagingOeeResult_date_lineDesc_shift_key" ON "StagingOeeResult"("date", "lineDesc", "shift");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
