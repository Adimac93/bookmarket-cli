import { Book, Grade, PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export async function uploadBook(book: Book) {
    try {
        await db.book.upsert({
            where: { id: book.id },
            create: { ...book },
            update: { price: book.price },
        });
        console.log("Uploaded");
    } catch (err) {
        console.log(`Error occured while uploading ${book.title}`);
    }
}

export const getGradeBooks = async (grade: Grade) => await db.book.findMany({ where: { grade } });
