/*
  Warnings:

  - A unique constraint covering the columns `[keyname]` on the table `ai_conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ai_conversation` ADD COLUMN `history` JSON NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ai_conversation_keyname_key` ON `ai_conversation`(`keyname`);
