/*
  Warnings:

  - Added the required column `project_id` to the `ai_conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ai_conversation` ADD COLUMN `project_id` VARCHAR(255) NOT NULL;
