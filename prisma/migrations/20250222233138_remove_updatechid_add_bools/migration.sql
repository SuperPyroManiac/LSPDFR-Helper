/*
  Warnings:

  - You are about to drop the column `ahCases` on the `servers` table. All the data in the column will be lost.
  - You are about to drop the column `autoSupport` on the `servers` table. All the data in the column will be lost.
  - You are about to drop the column `updateChId` on the `servers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `servers` DROP COLUMN `ahCases`,
    DROP COLUMN `autoSupport`,
    DROP COLUMN `updateChId`,
    ADD COLUMN `ahType` ENUM('TICKET', 'HYBRID', 'CHANNEL') NOT NULL DEFAULT 'TICKET',
    ADD COLUMN `redirect` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `request` BOOLEAN NOT NULL DEFAULT true;
