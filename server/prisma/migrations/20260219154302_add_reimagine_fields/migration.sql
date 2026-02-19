-- AlterTable
ALTER TABLE `ai_generations` ADD COLUMN `generation_type` ENUM('SCRATCH', 'REIMAGINE') NOT NULL DEFAULT 'SCRATCH',
    ADD COLUMN `placement_instructions` TEXT NULL,
    ADD COLUMN `room_image_url` VARCHAR(500) NULL;
