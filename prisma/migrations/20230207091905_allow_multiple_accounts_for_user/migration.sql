-- AlterTable
ALTER TABLE
  `User`
ADD
  COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
ADD
  COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

ALTER TABLE
  `User` ALTER `updatedAt` DROP DEFAULT;