-- DropIndex
DROP INDEX "formalization_stages_dossierId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "formalization_stages_dossierId_stageNumber_key" ON "formalization_stages"("dossierId", "stageNumber");

