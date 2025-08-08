-- CreateTable
CREATE TABLE "BlacklistedGame" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "steamId" TEXT NOT NULL,
    "appid" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "steam_appid_idx" ON "BlacklistedGame"("steamId", "appid");

-- CreateIndex
CREATE UNIQUE INDEX "BlacklistedGame_steamId_appid_key" ON "BlacklistedGame"("steamId", "appid");
