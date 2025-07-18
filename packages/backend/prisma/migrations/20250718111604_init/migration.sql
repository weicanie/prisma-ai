-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(500) NOT NULL,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `email` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_conversation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `keyname` VARCHAR(100) NOT NULL,
    `label` VARCHAR(100) NOT NULL,
    `content` JSON NULL,
    `user_id` INTEGER NOT NULL,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `link` VARCHAR(500) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `title` LONGTEXT NOT NULL,
    `quiz_type` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `content_mindmap` LONGTEXT NULL,
    `user_note` LONGTEXT NULL,
    `gist` LONGTEXT NOT NULL,
    `content_type` VARCHAR(255) NOT NULL,
    `job_type` VARCHAR(255) NULL,
    `hard` VARCHAR(255) NOT NULL,
    `anki_note_id` BIGINT NULL,
    `time_create` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `time_update` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `interview_summary_id` INTEGER NULL,

    UNIQUE INDEX `article_link_key`(`link`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `interview_summary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_link` VARCHAR(500) NULL,
    `content_hash` VARCHAR(32) NOT NULL,
    `turn` VARCHAR(100) NULL,
    `company_name` VARCHAR(255) NULL,
    `company_scale` VARCHAR(100) NULL,
    `job_type` VARCHAR(255) NOT NULL,
    `job_name` VARCHAR(255) NULL,
    `job_link` VARCHAR(500) NULL,
    `content` LONGTEXT NOT NULL,
    `user_id` INTEGER NOT NULL,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `interview_summary_post_link_key`(`post_link`),
    UNIQUE INDEX `interview_summary_content_hash_key`(`content_hash`),
    INDEX `user_id`(`user_id`),
    INDEX `company_name`(`company_name`),
    INDEX `job_type`(`job_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `project_name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `user_project_user_id_project_name_key`(`user_id`, `project_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_file` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `file_path` VARCHAR(1024) NOT NULL,
    `hash` VARCHAR(256) NOT NULL,
    `user_project_id` INTEGER NOT NULL,

    UNIQUE INDEX `project_file_user_project_id_file_path_key`(`user_project_id`, `file_path`(255)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_file_chunk` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_file_id` INTEGER NOT NULL,
    `vector_id` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `project_file_chunk_vector_id_key`(`vector_id`),
    INDEX `project_file_chunk_project_file_id_idx`(`project_file_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ai_conversation` ADD CONSTRAINT `ai_conversation_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article` ADD CONSTRAINT `article_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interview_summary` ADD CONSTRAINT `interview_summary_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_project` ADD CONSTRAINT `user_project_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_file` ADD CONSTRAINT `project_file_user_project_id_fkey` FOREIGN KEY (`user_project_id`) REFERENCES `user_project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_file_chunk` ADD CONSTRAINT `project_file_chunk_project_file_id_fkey` FOREIGN KEY (`project_file_id`) REFERENCES `project_file`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
