import { Book, Grade, Subject } from '@prisma/client';

import { prompt, registerPrompt } from 'inquirer';
import { fetchedBook, gradeConvert, subjectConvert } from './common';
registerPrompt('search-list', require('inquirer-search-list'));

import { booksSchema } from './schema';
import { displayBook } from './view';

export async function promptEditBook(book: fetchedBook) {
	console.log(displayBook(book));
	const editedBook = await editBook(book);
	if (book == editedBook) {
		console.log('Nothing changed');
	} else {
		console.log(displayBook(editedBook));
		console.log('---');
	}
	return editedBook;
}

async function editBook(book: fetchedBook): Promise<Book> {
	const fill = await prompt([
		{
			name: 'title',
			message: '🏷 Title',
			default: 'brak tytułu',
			type: 'input',
			when: () => !book.title,
		},
		{
			name: 'author',
			message: '✍ Authors',
			default: 'brak autora',
			type: 'input',
			when: () => !book.author,
			filter: (authors: string) => {
				return authors
					.split(',')
					.map((author) => {
						const match = author.trim().match(/(\S+)+/giu);
						if (match) {
							return match.join(' ');
						}
						return author.trim();
					})
					.join(', ');
			},
		},
		{
			name: 'grade',
			message: '🎓 Grade',
			type: 'list',
			choices: Object.entries(gradeConvert).map(([name, value]) => {
				return { name, value };
			}),
			when: () => !book.grade,
		},
		{
			name: 'subject',
			message: '📑 Subject',
			type: 'search-list',
			choices: Object.entries(subjectConvert).map(([name, value]) => {
				return { name, value };
			}),
			when: () => !book.subject,
		},
		{
			name: 'is_advanced',
			message: '🚩 Is advanced',
			type: 'confirm',
			when: () => book.is_advanced == undefined,
		},
	]);
	return {
		title: fill.title || book.title,
		author: fill.author || book.author,
		grade: fill.grade || book.grade,
		subject: fill.subject || book.subject,
		is_advanced:
			fill.is_advanced != undefined ? fill.is_advanced : book.is_advanced,
		price: book.price,
		image: book.image,
		id: book.id,
		url: book.url,
	};
}

export async function promptEditBooks(books: Book[]) {
	const editedBooks: Book[] = [];
	for (let book of books) editedBooks.push(await promptEditBook(book));

	return editedBooks;
}

export async function promptEditSchema() {
	const options = await prompt([
		{
			name: 'grade',
			message: '🎓 Choose grade',
			type: 'list',
			choices: Object.keys(Grade),
		},
		{
			name: 'subjects',
			message: '📑 Choose subjects',
			type: 'checkbox',
			choices: (options) => booksSchema.get(options.grade),
		},
	]);

	booksSchema.set(options.grade, options.subjects);
	booksSchema.save();
}
