-- AlterTable
ALTER TABLE "Book" ADD COLUMN "rating" DOUBLE PRECISION,
                   ADD COLUMN "viewsCount" INTEGER NOT NULL DEFAULT 0; 