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
		const date = new Date();
		await db.book.deleteMany();
		await db.book.createMany({
			data: [
				{
					isbn: '1',
					title: 'Biology 2',
					author: 'unknown',
					price: 20,
					image: 'none',
					grade: 'SECOND',
					subject: 'BIOLOGY',
					isAdvanced: true,
					url: 'none',
					updated: date,
				},
				{
					isbn: '6',
					title: 'Biology 4',
					author: 'unknown',
					price: 40,
					image: 'none',
					grade: 'FOURTH',
					subject: 'BIOLOGY',
					isAdvanced: true,
					url: 'none',
					updated: date,
				},
			],
		});
	});

	it('add books', () => {
		const date = new Date();
		const book: Book = {
			isbn: '1',
			title: 'Biology 2',
			author: 'unknown',
			price: 10,
			image: 'none',
			grade: 'SECOND',
			subject: 'BIOLOGY',
			isAdvanced: false,
			url: 'none',
			updated: date,
			created: date,
		};
		const books: Book[] = [
			{
				isbn: '2',
				title: 'Biology 2',
				author: 'unknown',
				price: 10,
				image: 'none',
				grade: 'SECOND',
				subject: 'BIOLOGY',
				isAdvanced: false,
				url: 'none',
				updated: date,
				created: date,
			},
			{
				isbn: '3',
				title: 'Biology 3',
				author: 'unknown',
				price: 7,
				image: 'none',
				grade: 'THIRD',
				subject: 'BIOLOGY',
				isAdvanced: true,
				url: 'none',
				updated: date,
				created: date,
			},
			{
				isbn: '4',
				title: 'Math 3',
				author: 'unknown',
				price: 20,
				image: 'none',
				grade: 'THIRD',
				subject: 'MATH',
				isAdvanced: true,
				url: 'none',
				updated: date,
				created: date,
			},
			{
				isbn: '5',
				title: 'History 1',
				author: 'unknown',
				price: 25,
				image: 'none',
				grade: 'FIRST',
				subject: 'HISTORY',
				isAdvanced: true,
				url: 'none',
				updated: date,
				created: date,
			},
			// doubled isbn - shouldn't be added
			{
				isbn: '5',
				title: 'History 1',
				author: 'unknown',
				price: 25,
				image: 'none',
				grade: 'FIRST',
				subject: 'HISTORY',
				isAdvanced: true,
				url: 'none',
				updated: date,
				created: date,
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
