import { Book, Grade, PrismaClient } from '@prisma/client';

export const db = new PrismaClient();

export async function uploadBook(book: Book, force?: boolean) {
	try {
		await db.book.upsert({
			where: { id: book.id },
			create: { ...book },
			update: force ? { ...book } : { price: book.price },
		});
	} catch (err) {
		console.log(`Error occured while uploading ${book.title}`);
	}
}

export const getGradeBooks = async (grade: Grade) =>
	await db.book.findMany({ where: { grade } });

export const diff = async (registeredBooks: Set<string>) => {
	return await db.book.findMany({
		where: { id: { notIn: Array.from(registeredBooks) } },
	});
};
