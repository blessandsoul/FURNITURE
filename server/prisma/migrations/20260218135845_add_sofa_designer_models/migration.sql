-- CreateTable
CREATE TABLE `furniture_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `base_price` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'GEL',
    `image_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `furniture_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `option_groups` (
    `id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `option_groups_category_id_idx`(`category_id`),
    UNIQUE INDEX `option_groups_category_id_slug_key`(`category_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `option_values` (
    `id` VARCHAR(191) NOT NULL,
    `group_id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `price_modifier` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `color_hex` VARCHAR(7) NULL,
    `image_url` VARCHAR(500) NULL,
    `prompt_hint` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `option_values_group_id_idx`(`group_id`),
    UNIQUE INDEX `option_values_group_id_slug_key`(`group_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `designs` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'GEL',
    `config_snapshot` JSON NOT NULL,
    `image_url` VARCHAR(500) NULL,
    `thumbnail_url` VARCHAR(500) NULL,
    `status` ENUM('DRAFT', 'GENERATED', 'QUOTED') NOT NULL DEFAULT 'DRAFT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `designs_user_id_idx`(`user_id`),
    INDEX `designs_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `design_option_items` (
    `id` VARCHAR(191) NOT NULL,
    `design_id` VARCHAR(191) NOT NULL,
    `option_value_id` VARCHAR(191) NOT NULL,

    INDEX `design_option_items_design_id_idx`(`design_id`),
    INDEX `design_option_items_option_value_id_idx`(`option_value_id`),
    UNIQUE INDEX `design_option_items_design_id_option_value_id_key`(`design_id`, `option_value_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_generations` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `design_id` VARCHAR(191) NULL,
    `prompt` TEXT NOT NULL,
    `user_free_text` TEXT NULL,
    `model` VARCHAR(50) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `image_url` VARCHAR(500) NULL,
    `thumbnail_url` VARCHAR(500) NULL,
    `error_message` TEXT NULL,
    `prompt_tokens` INTEGER NULL,
    `total_tokens` INTEGER NULL,
    `was_free` BOOLEAN NOT NULL DEFAULT false,
    `credits_used` INTEGER NOT NULL DEFAULT 0,
    `duration_ms` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ai_generations_user_id_idx`(`user_id`),
    INDEX `ai_generations_design_id_idx`(`design_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_balances` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `balance` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `credit_balances_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `type` ENUM('PURCHASE', 'GENERATION', 'REFUND', 'BONUS', 'ADJUSTMENT') NOT NULL,
    `description` VARCHAR(500) NULL,
    `reference_id` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `credit_transactions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_packages` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `credits` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'GEL',
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotes` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `design_id` VARCHAR(191) NOT NULL,
    `contact_name` VARCHAR(100) NOT NULL,
    `contact_email` VARCHAR(255) NOT NULL,
    `contact_phone` VARCHAR(20) NOT NULL,
    `message` TEXT NULL,
    `quoted_price` DECIMAL(10, 2) NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'GEL',
    `status` ENUM('PENDING', 'VIEWED', 'CONTACTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `admin_notes` TEXT NULL,
    `responded_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `quotes_user_id_idx`(`user_id`),
    INDEX `quotes_design_id_idx`(`design_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `option_groups` ADD CONSTRAINT `option_groups_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `furniture_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `option_values` ADD CONSTRAINT `option_values_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `option_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `designs` ADD CONSTRAINT `designs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `designs` ADD CONSTRAINT `designs_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `furniture_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `design_option_items` ADD CONSTRAINT `design_option_items_design_id_fkey` FOREIGN KEY (`design_id`) REFERENCES `designs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `design_option_items` ADD CONSTRAINT `design_option_items_option_value_id_fkey` FOREIGN KEY (`option_value_id`) REFERENCES `option_values`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_generations` ADD CONSTRAINT `ai_generations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_generations` ADD CONSTRAINT `ai_generations_design_id_fkey` FOREIGN KEY (`design_id`) REFERENCES `designs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_balances` ADD CONSTRAINT `credit_balances_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_transactions` ADD CONSTRAINT `credit_transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotes` ADD CONSTRAINT `quotes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotes` ADD CONSTRAINT `quotes_design_id_fkey` FOREIGN KEY (`design_id`) REFERENCES `designs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
