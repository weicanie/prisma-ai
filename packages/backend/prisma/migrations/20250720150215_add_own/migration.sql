-- AlterTable
ALTER TABLE `interview_summary` ADD COLUMN `own` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `job_type` ON `article`(`job_type`);

-- CreateIndex
CREATE INDEX `content_type` ON `article`(`content_type`);

-- CreateIndex
CREATE INDEX `quiz_type` ON `article`(`quiz_type`);

-- CreateIndex
CREATE INDEX `hard` ON `article`(`hard`);

-- CreateIndex
CREATE INDEX `company_scale` ON `interview_summary`(`company_scale`);

-- CreateIndex
CREATE INDEX `turn` ON `interview_summary`(`turn`);

-- CreateIndex
CREATE INDEX `interview_type` ON `interview_summary`(`interview_type`);
