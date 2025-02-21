-- CreateTable
CREATE TABLE `plugins` (
    `name` VARCHAR(255) NOT NULL,
    `dname` TEXT NOT NULL,
    `description` TEXT NULL,
    `version` VARCHAR(100) NULL,
    `eaVersion` VARCHAR(100) NULL,
    `id` INTEGER NULL,
    `link` TEXT NULL,
    `type` ENUM('LSPDFR', 'RPH', 'ASI', 'SHV', 'SHVDN', 'LIBRARY') NOT NULL,
    `state` ENUM('NORMAL', 'EXTERNAL', 'BROKEN', 'IGNORE') NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `errors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pattern` TEXT NULL,
    `solution` TEXT NULL,
    `description` TEXT NULL,
    `stringMatch` BOOLEAN NOT NULL,
    `level` ENUM('PMSG', 'PIMG', 'XTRA', 'WARN', 'SEVERE', 'CRITICAL') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cases` (
    `id` VARCHAR(255) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,
    `serverId` VARCHAR(191) NOT NULL,
    `open` BOOLEAN NOT NULL,
    `createDate` DATETIME(3) NOT NULL,
    `expireDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servers` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `banned` BOOLEAN NOT NULL DEFAULT false,
    `autoSupport` BOOLEAN NOT NULL DEFAULT true,
    `ahCases` BOOLEAN NOT NULL DEFAULT true,
    `ahChId` VARCHAR(191) NOT NULL DEFAULT '0',
    `ahMonChId` VARCHAR(191) NOT NULL DEFAULT '0',
    `announceChId` VARCHAR(191) NOT NULL DEFAULT '0',
    `updateChId` VARCHAR(191) NOT NULL DEFAULT '0',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `banned` BOOLEAN NOT NULL DEFAULT false,
    `botEditor` BOOLEAN NOT NULL DEFAULT false,
    `botAdmin` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `updatewebhooks` (
    `serverId` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,
    `webhookUrl` TEXT NOT NULL,

    PRIMARY KEY (`serverId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

