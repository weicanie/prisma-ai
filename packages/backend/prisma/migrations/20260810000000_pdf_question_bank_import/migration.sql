CREATE TABLE `pdf_question_import_meta` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `article_id` INTEGER NOT NULL,
  `user_id` INTEGER NOT NULL,
  `input_hash` VARCHAR(64) NOT NULL,
  `pipeline_version` VARCHAR(64) NOT NULL,
  `project_repository` VARCHAR(255) NULL,
  `status` VARCHAR(32) NOT NULL,
  `failure_reason` LONGTEXT NULL,
  `attempt_count` INTEGER NOT NULL DEFAULT 0,
  `create_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `update_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  UNIQUE INDEX `pdf_question_import_meta_article_id_key`(`article_id`),
  UNIQUE INDEX `pdf_question_import_meta_user_id_input_hash_key`(`user_id`, `input_hash`),
  INDEX `pdf_question_import_meta_user_id_status_idx`(`user_id`, `status`),
  PRIMARY KEY (`id`),
  CONSTRAINT `pdf_question_import_meta_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pdf_question_import_meta_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
