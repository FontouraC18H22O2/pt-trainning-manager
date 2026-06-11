/*
  Warnings:

  - You are about to drop the column `username` on the `users_admin` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `users_admin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_admin_id` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `users_admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `users_admin` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `users_admin_username_key` ON `users_admin`;

-- AlterTable
ALTER TABLE `students` ADD COLUMN `user_admin_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `users_admin` DROP COLUMN `username`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `nome` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` ENUM('ADMIN', 'PT', 'GUEST') NOT NULL DEFAULT 'PT';

-- CreateTable
CREATE TABLE `global_exercises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `gif_url` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `global_exercises_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weight_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `exercise_name` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `reps_done` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `users_admin_email_key` ON `users_admin`(`email`);

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_user_admin_id_fkey` FOREIGN KEY (`user_admin_id`) REFERENCES `users_admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weight_logs` ADD CONSTRAINT `weight_logs_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
