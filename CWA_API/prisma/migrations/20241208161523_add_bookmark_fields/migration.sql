/*
  Warnings:

  - Added the required column `title` to the `Bookmark` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bookmark" ADD COLUMN     "color" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;
