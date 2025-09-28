/*
  Warnings:

  - You are about to drop the column `interview_summary_id` on the `article` table. All the data in the column will be lost.
  - You are about to drop the `interview_summary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `interview_summary` DROP FOREIGN KEY `interview_summary_user_id_fkey`;

-- AlterTable
ALTER TABLE `article` DROP COLUMN `interview_summary_id`;

-- DropTable
DROP TABLE `interview_summary`;
