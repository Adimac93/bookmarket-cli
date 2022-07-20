import { Book, Grade, PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const isTestMode = process.env.NODE_ENV === 'test';
const isRemoteDb = process.env.IS_REMOTE_DB === 'true';
export const db = new PrismaClient({
	datasources: {
		db: {
			url: isTestMode
				? isRemoteDb
					? process.env.DATABASE_URL_CLOUD_TEST
					: process.env.DATABASE_URL_TEST
				: isRemoteDb
				? process.env.DATABASE_URL_CLOUD
				: process.env.DATABASE_URL,
		},
	},
});

if (isTestMode) {
	console.log(`
DB TEST MODE ON 
change 'schema.prisma' to be able to use 'npx prisma studio'

datasource db {
	provider = "postgresql"
	url      = env("DATABASE_URL_CLOUD_TEST" | "DATABASE_URL_TEST") <--- change db url to one of these
}
`);
}

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
