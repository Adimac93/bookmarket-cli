/*
  Warnings:

  - The primary key for the `Book` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `is_advanced` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `discord_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `facebook_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `google_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `BookCopy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookInCart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookWithCondition` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[discordId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[facebookId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isAdvanced` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isbn` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'DELIVERED');

-- AlterEnum
ALTER TYPE "Subject" ADD VALUE 'EDUCATION_FOR_SAFETY';

-- DropForeignKey
ALTER TABLE "BookCopy" DROP CONSTRAINT "BookCopy_book_id_condition_fkey";

-- DropForeignKey
ALTER TABLE "BookCopy" DROP CONSTRAINT "BookCopy_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "BookInCart" DROP CONSTRAINT "BookInCart_book_id_condition_fkey";

-- DropForeignKey
ALTER TABLE "BookInCart" DROP CONSTRAINT "BookInCart_user_id_fkey";

-- DropForeignKey
ALTER TABLE "BookWithCondition" DROP CONSTRAINT "BookWithCondition_book_id_fkey";

-- DropIndex
DROP INDEX "User_discord_id_key";

-- DropIndex
DROP INDEX "User_facebook_id_key";

-- DropIndex
DROP INDEX "User_google_id_key";

-- DropIndex
DROP INDEX "User_phone_number_key";

-- AlterTable
ALTER TABLE "Book" DROP CONSTRAINT "Book_pkey",
DROP COLUMN "id",
DROP COLUMN "is_advanced",
ADD COLUMN     "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isAdvanced" BOOLEAN NOT NULL,
ADD COLUMN     "isbn" TEXT NOT NULL,
ADD COLUMN     "updated" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Book_pkey" PRIMARY KEY ("isbn");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "discord_id",
DROP COLUMN "facebook_id",
DROP COLUMN "google_id",
DROP COLUMN "phone_number",
ADD COLUMN     "discordId" TEXT,
ADD COLUMN     "facebookId" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- DropTable
DROP TABLE "BookCopy";

-- DropTable
DROP TABLE "BookInCart";

-- DropTable
DROP TABLE "BookWithCondition";

-- CreateTable
CREATE TABLE "Base" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderBook" (
    "condition" "Condition" NOT NULL,
    "count" INTEGER NOT NULL,
    "isbn" TEXT NOT NULL,
    "orderId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbr" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "schema" JSONB NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBook" (
    "condition" "Condition" NOT NULL,
    "count" INTEGER NOT NULL,
    "isbn" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderBook_condition_isbn_orderId_key" ON "OrderBook"("condition", "isbn", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBook_condition_isbn_ownerId_key" ON "UserBook"("condition", "isbn", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "User_facebookId_key" ON "User"("facebookId");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderBook" ADD CONSTRAINT "OrderBook_isbn_fkey" FOREIGN KEY ("isbn") REFERENCES "Book"("isbn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderBook" ADD CONSTRAINT "OrderBook_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_id_fkey" FOREIGN KEY ("id") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBook" ADD CONSTRAINT "UserBook_isbn_fkey" FOREIGN KEY ("isbn") REFERENCES "Book"("isbn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBook" ADD CONSTRAINT "UserBook_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
