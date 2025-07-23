/*
  Warnings:

  - You are about to drop the column `user_id` on the `article` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `article` DROP FOREIGN KEY `article_ibfk_1`;

-- DropIndex
DROP INDEX `user_id` ON `article`;

-- AlterTable
ALTER TABLE `article` DROP COLUMN `user_id`;

-- CreateTable
CREATE TABLE `user_article` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `article_id` INTEGER NOT NULL,
    `synced_anki` BOOLEAN NOT NULL DEFAULT false,

    INDEX `user_article_user_id_idx`(`user_id`),
    INDEX `user_article_article_id_idx`(`article_id`),
    UNIQUE INDEX `user_article_user_id_article_id_key`(`user_id`, `article_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_article` ADD CONSTRAINT `user_article_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_article` ADD CONSTRAINT `user_article_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
