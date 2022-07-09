import { Book } from '@prisma/client';
import { Books } from '.';
import * as fs from 'node:fs';

describe('Books state session storage', () => {
	let booksStorage: Books;
	const savePath = './src/lib/sessions/test.books.json';

	beforeAll(() => {
		if (fs.existsSync(savePath)) fs.unlinkSync(savePath);
		booksStorage = new Books(savePath);
	});

	it('add books', () => {
		const book: Book = {
			id: '1',
			title: 'Biology 2',
			author: 'unknown',
			price: 10,
			image: 'none',
			grade: 'SECOND',
			subject: 'BIOLOGY',
			is_advanced: false,
		};
		const books: Book[] = [
			{
				id: '1',
				title: 'Biology 2',
				author: 'unknown',
				price: 10,
				image: 'none',
				grade: 'SECOND',
				subject: 'BIOLOGY',
				is_advanced: false,
			},
			{
				id: '2',
				title: 'Biology 3',
				author: 'unknown',
				price: 7,
				image: 'none',
				grade: 'THIRD',
				subject: 'BIOLOGY',
				is_advanced: true,
			},
			{
				id: '3',
				title: 'Math 3',
				author: 'unknown',
				price: 20,
				image: 'none',
				grade: 'THIRD',
				subject: 'MATH',
				is_advanced: true,
			},
		];
		booksStorage.update(book);
		booksStorage.update(books);
		expect(booksStorage.books).toHaveLength(4);
	});
	it('get all books', () => {
		const books = booksStorage.get();
		expect(books).toHaveLength(4);
	});
	it('get filtered books by grade', () => {
		const books = booksStorage.get({ grade: 'SECOND' });
		expect(books).toHaveLength(2);
	});
	it('get filtered books by grade and subject', () => {
		const books = booksStorage.get({ grade: 'THIRD', subject: 'MATH' });
		expect(books).toHaveLength(1);
	});
	it('save to file', async () => {
		expect(await booksStorage.save());
	});
	it('read from file', () => {
		booksStorage = new Books(savePath);
		const books = booksStorage.get();
		expect(books.length).toBe(4);
	});
});
