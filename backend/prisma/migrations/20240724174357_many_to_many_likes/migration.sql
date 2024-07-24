/*
  Warnings:

  - You are about to drop the column `likedPlaces` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "likedPlaces";

-- CreateTable
CREATE TABLE "likedPlace" (
    "id" TEXT NOT NULL,

    CONSTRAINT "likedPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserTolikedPlace" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserTolikedPlace_AB_unique" ON "_UserTolikedPlace"("A", "B");

-- CreateIndex
CREATE INDEX "_UserTolikedPlace_B_index" ON "_UserTolikedPlace"("B");

-- AddForeignKey
ALTER TABLE "_UserTolikedPlace" ADD CONSTRAINT "_UserTolikedPlace_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTolikedPlace" ADD CONSTRAINT "_UserTolikedPlace_B_fkey" FOREIGN KEY ("B") REFERENCES "likedPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
