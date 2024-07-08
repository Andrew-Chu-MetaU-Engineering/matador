/*
  Warnings:

  - You are about to drop the column `cuisines` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hobbies` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "cuisines",
DROP COLUMN "hobbies",
ADD COLUMN     "interests" TEXT[];
