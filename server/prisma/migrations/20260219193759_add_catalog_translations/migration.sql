-- AlterTable
ALTER TABLE `furniture_categories` ADD COLUMN `translations` JSON NULL;

-- AlterTable
ALTER TABLE `option_groups` ADD COLUMN `translations` JSON NULL;

-- AlterTable
ALTER TABLE `option_values` ADD COLUMN `translations` JSON NULL;
