import { Book } from '@prisma/client';
import { Books } from '.';
import * as fs from 'node:fs';
import { db } from '../database';

describe('Books state session storage', () => {
	let booksStorage: Books;
	const savePath = './src/lib/sessions/test.books.json';

	beforeAll(async () => {
		if (fs.existsSync(savePath)) fs.unlinkSync(savePath);
		booksStorage = new Books(savePath);
		await db.book.deleteMany();
		await db.book.createMany({
			data: [
				{
					id: '1',
					title: 'Biology 2',
					author: 'unknown',
					price: 20,
					image: 'none',
					grade: 'SECOND',
					subject: 'BIOLOGY',
					is_advanced: true,
					url: 'none',
				},
				{
					id: '6',
					title: 'Biology 4',
					author: 'unknown',
					price: 40,
					image: 'none',
					grade: 'FOURTH',
					subject: 'BIOLOGY',
					is_advanced: true,
					url: 'none',
				},
			],
		});
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
			url: 'none',
		};
		const books: Book[] = [
			{
				id: '2',
				title: 'Biology 2',
				author: 'unknown',
				price: 10,
				image: 'none',
				grade: 'SECOND',
				subject: 'BIOLOGY',
				is_advanced: false,
				url: 'none',
			},
			{
				id: '3',
				title: 'Biology 3',
				author: 'unknown',
				price: 7,
				image: 'none',
				grade: 'THIRD',
				subject: 'BIOLOGY',
				is_advanced: true,
				url: 'none',
			},
			{
				id: '4',
				title: 'Math 3',
				author: 'unknown',
				price: 20,
				image: 'none',
				grade: 'THIRD',
				subject: 'MATH',
				is_advanced: true,
				url: 'none',
			},
			{
				id: '5',
				title: 'History 1',
				author: 'unknown',
				price: 25,
				image: 'none',
				grade: 'FIRST',
				subject: 'HISTORY',
				is_advanced: true,
				url: 'none',
			},
			// doubled id - shouldn't be added
			{
				id: '5',
				title: 'History 1',
				author: 'unknown',
				price: 25,
				image: 'none',
				grade: 'FIRST',
				subject: 'HISTORY',
				is_advanced: true,
				url: 'none',
			},
		];
		booksStorage.update(book);
		booksStorage.update(books);
		expect(booksStorage.books).toHaveLength(books.length);
	});
	it('get all books', () => {
		const books = booksStorage.get();
		expect(books).toHaveLength(5);
	});
	it('get filtered books by grade', () => {
		const books = booksStorage.get({ grade: ['SECOND'] });
		expect(books).toHaveLength(2);
	});
	it('get filtered books by grade and subject', () => {
		const books = booksStorage.get({
			grade: ['THIRD', 'FIRST'],
			subject: ['MATH', 'HISTORY'],
		});
		expect(books).toHaveLength(2);
	});
	it('synch with database', async () => {
		await booksStorage.synch();
		const books = booksStorage.get();
		expect(books).toHaveLength(6);
	});
	it('synch with database (force)', async () => {
		await booksStorage.synch(true);
		const books = booksStorage.get();
		expect(books).toHaveLength(6);
	});
	it('save to file', async () => {
		expect(await booksStorage.save());
	});
	it('read from file', () => {
		booksStorage = new Books(savePath);
		const books = booksStorage.get();
		expect(books).toHaveLength(6);
	});
});
