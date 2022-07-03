-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NEW', 'GOOD', 'DAMAGED', 'BAD');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('FIRST', 'SECOND', 'THIRD', 'FOURTH');

-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('MATH', 'ENGLISH', 'POLISH', 'GERMAN', 'RUSSIAN', 'HISTORY', 'CIVICS', 'CHEMISTRY', 'BIOLOGY', 'GEOGRAPHY', 'PHYSICS', 'COMPUTER_SCIENCE', 'ENTREPRENEURSHIP');

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "grade" "Grade" NOT NULL,
    "subject" "Subject" NOT NULL,
    "is_advanced" BOOLEAN NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookCopy" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "condition" "Condition" NOT NULL,

    CONSTRAINT "BookCopy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookInCart" (
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "condition" "Condition" NOT NULL
);

-- CreateTable
CREATE TABLE "BookWithCondition" (
    "book_id" TEXT NOT NULL,
    "condition" "Condition" NOT NULL,

    CONSTRAINT "BookWithCondition_pkey" PRIMARY KEY ("book_id","condition")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT,
    "discord_id" TEXT,
    "google_id" TEXT,
    "facebook_id" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookInCart_book_id_user_id_key" ON "BookInCart"("book_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_number_key" ON "User"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "User_discord_id_key" ON "User"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_facebook_id_key" ON "User"("facebook_id");

-- AddForeignKey
ALTER TABLE "BookCopy" ADD CONSTRAINT "BookCopy_book_id_condition_fkey" FOREIGN KEY ("book_id", "condition") REFERENCES "BookWithCondition"("book_id", "condition") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookCopy" ADD CONSTRAINT "BookCopy_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookInCart" ADD CONSTRAINT "BookInCart_book_id_condition_fkey" FOREIGN KEY ("book_id", "condition") REFERENCES "BookWithCondition"("book_id", "condition") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookInCart" ADD CONSTRAINT "BookInCart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookWithCondition" ADD CONSTRAINT "BookWithCondition_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
