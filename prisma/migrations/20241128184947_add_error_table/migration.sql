-- CreateTable
CREATE TABLE `plugins` (
    `name` VARCHAR(191) NOT NULL,
    `dname` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `version` VARCHAR(191) NULL,
    `eaVersion` VARCHAR(191) NULL,
    `id` INTEGER NULL,
    `link` VARCHAR(191) NULL,
    `type` ENUM('LSPDFR', 'RPH', 'ASI', 'SHV', 'SHVDN', 'LIBRARY') NOT NULL,
    `state` ENUM('NORMAL', 'EXTERNAL', 'BROKEN', 'IGNORE') NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `errors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pattern` VARCHAR(191) NULL,
    `solution` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `stringMatch` BOOLEAN NOT NULL,
    `level` ENUM('PMSG', 'PIMG', 'XTRA', 'WARN', 'SEVERE', 'CRITICAL') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
