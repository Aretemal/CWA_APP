/*
  Warnings:

  - A unique constraint covering the columns `[uniqueIdentifier]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `author` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uniqueIdentifier` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "author" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "uniqueIdentifier" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Book_uniqueIdentifier_key" ON "Book"("uniqueIdentifier");
