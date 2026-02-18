/*
  Warnings:

  - Made the column `phone` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `phone` VARCHAR(20) NOT NULL;
