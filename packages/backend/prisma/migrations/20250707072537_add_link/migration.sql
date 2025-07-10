/*
  Warnings:

  - You are about to drop the column `type` on the `article` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[link]` on the table `article` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content_type` to the `article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quiz_type` to the `article` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `article` DROP COLUMN `type`,
    ADD COLUMN `content_type` VARCHAR(255) NOT NULL,
    ADD COLUMN `link` VARCHAR(500) NOT NULL,
    ADD COLUMN `quiz_type` VARCHAR(255) NOT NULL,
    ADD COLUMN `time_create` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `time_update` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `title` LONGTEXT NOT NULL,
    MODIFY `hard` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `article_link_key` ON `article`(`link`);
