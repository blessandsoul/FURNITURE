-- AlterTable: remove is_email_verified column
ALTER TABLE `users` DROP COLUMN `is_email_verified`;

-- AlterEnum: remove unused role values
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';
